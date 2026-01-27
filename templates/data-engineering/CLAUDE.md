# Data Engineering Development Guide

Staff-level guidelines for building robust, scalable data platforms and pipelines.

---

## Overview

This guide applies to:

- Batch and streaming data pipelines
- Data warehouses and lakehouses
- ETL/ELT orchestration
- Real-time data processing
- Data platform infrastructure
- Analytics engineering

### Key Principles

1. **Idempotency Is Non-Negotiable** - Every pipeline must produce the same result on re-run
2. **Data Quality Is a Feature** - Validate early, monitor continuously, alert proactively
3. **Schema Is a Contract** - Breaking changes require coordination and versioning
4. **Observability Over Debugging** - Instrument everything, debug nothing in production
5. **Cost-Aware Engineering** - Compute and storage have real costs; optimize deliberately

### Technology Stack

| Layer | Technologies |
|-------|--------------|
| Orchestration | Airflow, Dagster, Prefect, Temporal |
| Batch Processing | Spark, DBT, Pandas, Polars |
| Stream Processing | Kafka, Flink, Spark Streaming, Pulsar |
| Storage | Delta Lake, Iceberg, Parquet, S3/GCS/ADLS |
| Warehouses | Snowflake, BigQuery, Redshift, Databricks |
| Quality | Great Expectations, Soda, DBT Tests, Monte Carlo |
| Metadata | DataHub, Atlan, OpenMetadata, Unity Catalog |

---

## Project Structure

```
data-platform/
├── pipelines/              # Pipeline definitions
│   ├── ingestion/          # Source → Raw layer
│   ├── transformation/     # Raw → Curated layer
│   └── serving/            # Curated → Consumption layer
├── models/                 # DBT or Spark SQL models
│   ├── staging/            # 1:1 source mappings
│   ├── intermediate/       # Business logic transforms
│   └── marts/              # Consumption-ready tables
├── schemas/                # Schema definitions & contracts
│   ├── avro/
│   ├── protobuf/
│   └── json-schema/
├── quality/                # Data quality checks
│   ├── expectations/       # Great Expectations suites
│   └── tests/              # DBT tests
├── infrastructure/         # IaC for data platform
│   ├── terraform/
│   └── kubernetes/
├── scripts/                # Utility scripts
├── tests/                  # Pipeline tests
│   ├── unit/
│   └── integration/
└── docs/                   # Documentation
    └── data-dictionary/
```

---

## Pipeline Design Patterns

### Idempotent Pipeline Pattern

```python
def process_daily_orders(execution_date: date) -> None:
    """
    Idempotent pipeline: safe to re-run any number of times.
    
    Key principles:
    1. Delete-then-insert for the partition being processed
    2. Use execution_date, not current timestamp
    3. No side effects outside the target partition
    """
    partition = execution_date.strftime("%Y-%m-%d")
    
    # 1. Clear target partition (idempotency)
    spark.sql(f"""
        DELETE FROM curated.orders 
        WHERE order_date = '{partition}'
    """)
    
    # 2. Process source data for this partition only
    orders_df = (
        spark.read.table("raw.orders")
        .filter(F.col("order_date") == partition)
        .transform(validate_orders)
        .transform(enrich_orders)
        .transform(apply_business_rules)
    )
    
    # 3. Write to target partition
    (orders_df
        .write
        .mode("append")
        .partitionBy("order_date")
        .saveAsTable("curated.orders"))
```

### Streaming with Exactly-Once Semantics

```python
def process_events_stream() -> None:
    """
    Streaming pipeline with exactly-once guarantees.
    
    Key principles:
    1. Checkpoint for fault tolerance
    2. Idempotent sink operations
    3. Watermarking for late data handling
    """
    events = (
        spark.readStream
        .format("kafka")
        .option("kafka.bootstrap.servers", KAFKA_BROKERS)
        .option("subscribe", "user-events")
        .option("startingOffsets", "earliest")
        .load()
    )
    
    processed = (
        events
        .select(F.from_json(F.col("value").cast("string"), schema).alias("data"))
        .select("data.*")
        .withWatermark("event_time", "1 hour")  # Handle late arrivals
        .groupBy(
            F.window("event_time", "5 minutes"),
            "user_id"
        )
        .agg(F.count("*").alias("event_count"))
    )
    
    (processed
        .writeStream
        .format("delta")
        .outputMode("append")
        .option("checkpointLocation", CHECKPOINT_PATH)
        .trigger(processingTime="1 minute")
        .toTable("curated.user_activity"))
```

### Incremental Processing Pattern

```python
def incremental_load(
    source_table: str,
    target_table: str,
    watermark_column: str,
) -> None:
    """
    Efficient incremental loads using high watermark.
    
    Key principles:
    1. Track last processed watermark
    2. Process only new/changed records
    3. Handle both inserts and updates (CDC)
    """
    # Get high watermark from previous run
    last_watermark = get_watermark(target_table, watermark_column)
    
    # Read only new records
    new_records = (
        spark.read.table(source_table)
        .filter(F.col(watermark_column) > last_watermark)
    )
    
    if new_records.isEmpty():
        logger.info("No new records to process")
        return
    
    # Merge into target (upsert pattern)
    target = DeltaTable.forName(spark, target_table)
    
    (target.alias("target")
        .merge(
            new_records.alias("source"),
            "target.id = source.id"
        )
        .whenMatchedUpdateAll()
        .whenNotMatchedInsertAll()
        .execute())
    
    # Update watermark
    set_watermark(target_table, watermark_column, new_records.agg(F.max(watermark_column)))
```

---

## Data Modeling

### Layered Architecture (Medallion)

| Layer | Purpose | SLA | Example |
|-------|---------|-----|---------|
| **Bronze/Raw** | Exact copy of source | Minutes | `raw.salesforce_accounts` |
| **Silver/Curated** | Cleaned, validated, typed | Hours | `curated.accounts` |
| **Gold/Marts** | Business-ready aggregates | Daily | `marts.account_metrics` |

### Dimensional Modeling

```sql
-- Fact table: Immutable events with foreign keys
CREATE TABLE facts.orders (
    order_id STRING NOT NULL,
    order_date DATE NOT NULL,
    customer_key BIGINT NOT NULL,  -- FK to dimension
    product_key BIGINT NOT NULL,   -- FK to dimension
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    -- Metadata
    _loaded_at TIMESTAMP NOT NULL,
    _source_file STRING NOT NULL
)
USING DELTA
PARTITIONED BY (order_date)
TBLPROPERTIES ('delta.autoOptimize.optimizeWrite' = 'true');

-- Dimension table: Type 2 SCD for history tracking
CREATE TABLE dims.customers (
    customer_key BIGINT GENERATED ALWAYS AS IDENTITY,
    customer_id STRING NOT NULL,
    name STRING NOT NULL,
    email STRING,
    segment STRING,
    -- SCD Type 2 columns
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_current BOOLEAN NOT NULL,
    -- Metadata
    _loaded_at TIMESTAMP NOT NULL
)
USING DELTA;
```

### Type 2 Slowly Changing Dimension

```python
def apply_scd_type_2(
    spark: SparkSession,
    source_df: DataFrame,
    target_table: str,
    key_columns: list[str],
    tracked_columns: list[str],
) -> None:
    """
    Implement Type 2 SCD: Track full history of changes.
    
    - New records: Insert with is_current=True
    - Changed records: Close old record, insert new
    - Unchanged records: No action
    """
    target = DeltaTable.forName(spark, target_table)
    
    # Identify changes
    changes = (
        source_df.alias("source")
        .join(
            target.toDF().filter("is_current = true").alias("target"),
            on=key_columns,
            how="left"
        )
        .withColumn("_action", 
            F.when(F.col("target.customer_key").isNull(), "INSERT")
            .when(
                F.concat_ws("|", *[F.col(f"source.{c}") for c in tracked_columns]) !=
                F.concat_ws("|", *[F.col(f"target.{c}") for c in tracked_columns]),
                "UPDATE"
            )
            .otherwise("NONE")
        )
        .filter("_action != 'NONE'")
    )
    
    # Close old records
    (target.alias("target")
        .merge(
            changes.filter("_action = 'UPDATE'").alias("updates"),
            " AND ".join([f"target.{c} = updates.{c}" for c in key_columns]) +
            " AND target.is_current = true"
        )
        .whenMatchedUpdate(set={
            "effective_to": "current_date()",
            "is_current": "false"
        })
        .execute())
    
    # Insert new/changed records
    new_records = (
        changes
        .filter("_action IN ('INSERT', 'UPDATE')")
        .select(*[F.col(f"source.{c}") for c in source_df.columns])
        .withColumn("effective_from", F.current_date())
        .withColumn("effective_to", F.lit(None).cast("date"))
        .withColumn("is_current", F.lit(True))
        .withColumn("_loaded_at", F.current_timestamp())
    )
    
    new_records.write.mode("append").saveAsTable(target_table)
```

---

## Data Quality

### Validation Framework

```python
from great_expectations.core import ExpectationSuite
from great_expectations.dataset import SparkDFDataset

def validate_orders(df: DataFrame) -> DataFrame:
    """
    Apply data quality checks. Fail fast on critical issues.
    """
    ge_df = SparkDFDataset(df)
    
    # Critical checks - pipeline fails if violated
    critical_results = [
        ge_df.expect_column_values_to_not_be_null("order_id"),
        ge_df.expect_column_values_to_not_be_null("customer_id"),
        ge_df.expect_column_values_to_be_positive("quantity"),
        ge_df.expect_column_values_to_be_between("unit_price", min_value=0, max_value=100000),
    ]
    
    failures = [r for r in critical_results if not r.success]
    if failures:
        raise DataQualityError(f"Critical validation failed: {failures}")
    
    # Warning checks - log but continue
    warning_results = [
        ge_df.expect_column_values_to_match_regex("email", r"^[\w.-]+@[\w.-]+\.\w+$"),
        ge_df.expect_column_values_to_be_in_set("status", ["pending", "shipped", "delivered"]),
    ]
    
    for result in warning_results:
        if not result.success:
            logger.warning(f"Data quality warning: {result}")
            metrics.increment("data_quality.warnings")
    
    return df
```

### Data Freshness Monitoring

```python
@dataclass
class FreshnessCheck:
    table: str
    timestamp_column: str
    max_delay_hours: int
    severity: str  # "critical" | "warning"

FRESHNESS_CHECKS = [
    FreshnessCheck("curated.orders", "order_date", max_delay_hours=2, severity="critical"),
    FreshnessCheck("curated.inventory", "updated_at", max_delay_hours=1, severity="critical"),
    FreshnessCheck("marts.daily_sales", "report_date", max_delay_hours=24, severity="warning"),
]

def check_data_freshness() -> list[Alert]:
    """
    Monitor data freshness and alert on SLA violations.
    """
    alerts = []
    
    for check in FRESHNESS_CHECKS:
        max_timestamp = spark.sql(f"""
            SELECT MAX({check.timestamp_column}) as max_ts
            FROM {check.table}
        """).collect()[0]["max_ts"]
        
        delay_hours = (datetime.now() - max_timestamp).total_seconds() / 3600
        
        if delay_hours > check.max_delay_hours:
            alerts.append(Alert(
                severity=check.severity,
                message=f"Table {check.table} is {delay_hours:.1f}h stale (SLA: {check.max_delay_hours}h)",
                metric_name="data_freshness_delay_hours",
                metric_value=delay_hours,
            ))
    
    return alerts
```

### Anomaly Detection

```python
def detect_volume_anomalies(
    table: str,
    partition_column: str,
    lookback_days: int = 30,
    threshold_std: float = 3.0,
) -> Optional[Alert]:
    """
    Detect unusual record counts that may indicate pipeline issues.
    """
    stats = spark.sql(f"""
        WITH daily_counts AS (
            SELECT 
                {partition_column},
                COUNT(*) as record_count
            FROM {table}
            WHERE {partition_column} >= current_date() - INTERVAL {lookback_days} DAYS
            GROUP BY {partition_column}
        ),
        statistics AS (
            SELECT
                AVG(record_count) as mean_count,
                STDDEV(record_count) as std_count
            FROM daily_counts
            WHERE {partition_column} < current_date()  -- Exclude today for baseline
        )
        SELECT 
            dc.record_count as today_count,
            s.mean_count,
            s.std_count,
            ABS(dc.record_count - s.mean_count) / NULLIF(s.std_count, 0) as z_score
        FROM daily_counts dc, statistics s
        WHERE dc.{partition_column} = current_date()
    """).collect()[0]
    
    if stats["z_score"] and stats["z_score"] > threshold_std:
        direction = "high" if stats["today_count"] > stats["mean_count"] else "low"
        return Alert(
            severity="warning",
            message=f"Anomaly in {table}: {stats['today_count']} records ({direction}), "
                    f"expected ~{stats['mean_count']:.0f} ± {stats['std_count']:.0f}",
        )
    
    return None
```

---

## Testing Strategy

### Unit Tests for Transformations

```python
import pytest
from pyspark.sql import SparkSession
from chispa import assert_df_equality

@pytest.fixture(scope="session")
def spark():
    return SparkSession.builder.master("local[*]").getOrCreate()

class TestOrderTransformations:
    
    def test_calculate_order_total(self, spark):
        """Test that order totals are calculated correctly."""
        input_df = spark.createDataFrame([
            {"order_id": "1", "quantity": 2, "unit_price": 10.00},
            {"order_id": "2", "quantity": 3, "unit_price": 5.50},
        ])
        
        expected_df = spark.createDataFrame([
            {"order_id": "1", "quantity": 2, "unit_price": 10.00, "total": 20.00},
            {"order_id": "2", "quantity": 3, "unit_price": 5.50, "total": 16.50},
        ])
        
        result_df = calculate_order_total(input_df)
        
        assert_df_equality(result_df, expected_df, ignore_row_order=True)
    
    def test_filter_valid_orders(self, spark):
        """Test that invalid orders are filtered out."""
        input_df = spark.createDataFrame([
            {"order_id": "1", "quantity": 2, "status": "confirmed"},
            {"order_id": "2", "quantity": 0, "status": "confirmed"},  # Invalid: zero quantity
            {"order_id": "3", "quantity": 1, "status": "cancelled"},  # Invalid: cancelled
        ])
        
        result_df = filter_valid_orders(input_df)
        
        assert result_df.count() == 1
        assert result_df.collect()[0]["order_id"] == "1"
    
    def test_handles_null_values(self, spark):
        """Test graceful handling of null values."""
        input_df = spark.createDataFrame([
            {"order_id": "1", "customer_email": None},
            {"order_id": "2", "customer_email": "test@example.com"},
        ])
        
        result_df = enrich_customer_data(input_df)
        
        # Should not raise, should handle nulls gracefully
        assert result_df.filter("order_id = '1'").collect()[0]["email_domain"] is None
```

### Integration Tests for Pipelines

```python
@pytest.fixture(scope="class")
def test_database(spark):
    """Set up isolated test database."""
    spark.sql("CREATE DATABASE IF NOT EXISTS test_data_platform")
    yield "test_data_platform"
    spark.sql("DROP DATABASE test_data_platform CASCADE")

class TestOrdersPipeline:
    
    def test_end_to_end_pipeline(self, spark, test_database):
        """Test full pipeline from raw to mart."""
        # Arrange: Create test data in raw layer
        raw_orders = spark.createDataFrame([
            {"id": "1", "customer_id": "C1", "amount": 100.0, "order_date": "2024-01-15"},
            {"id": "2", "customer_id": "C1", "amount": 50.0, "order_date": "2024-01-15"},
            {"id": "3", "customer_id": "C2", "amount": 200.0, "order_date": "2024-01-15"},
        ])
        raw_orders.write.mode("overwrite").saveAsTable(f"{test_database}.raw_orders")
        
        # Act: Run pipeline
        run_orders_pipeline(
            source_table=f"{test_database}.raw_orders",
            target_table=f"{test_database}.curated_orders",
            execution_date=date(2024, 1, 15),
        )
        
        # Assert: Verify output
        result = spark.table(f"{test_database}.curated_orders")
        
        assert result.count() == 3
        assert result.filter("customer_id = 'C1'").count() == 2
        
        # Verify data quality columns added
        assert "_loaded_at" in result.columns
        assert "_source_file" in result.columns
    
    def test_idempotency(self, spark, test_database):
        """Verify pipeline produces same result on re-run."""
        # Run pipeline twice
        for _ in range(2):
            run_orders_pipeline(
                source_table=f"{test_database}.raw_orders",
                target_table=f"{test_database}.curated_orders",
                execution_date=date(2024, 1, 15),
            )
        
        # Should have same count, not doubled
        result = spark.table(f"{test_database}.curated_orders")
        assert result.count() == 3
```

### Data Contract Tests

```python
def test_schema_compatibility():
    """Ensure schema changes don't break downstream consumers."""
    current_schema = spark.table("curated.orders").schema
    
    # Required columns that consumers depend on
    required_columns = {
        "order_id": StringType(),
        "customer_id": StringType(),
        "order_date": DateType(),
        "total_amount": DecimalType(12, 2),
    }
    
    for col_name, expected_type in required_columns.items():
        assert col_name in [f.name for f in current_schema.fields], \
            f"Required column {col_name} missing from schema"
        
        actual_type = current_schema[col_name].dataType
        assert actual_type == expected_type, \
            f"Column {col_name} type changed: {actual_type} != {expected_type}"
```

---

## Performance Optimization

### Partitioning Strategy

```python
# Good: Partition by query patterns
(orders_df
    .write
    .partitionBy("order_date")  # Most queries filter by date
    .option("maxRecordsPerFile", 1_000_000)
    .saveAsTable("curated.orders"))

# Bad: Over-partitioning creates small files
(orders_df
    .write
    .partitionBy("order_date", "customer_id", "product_id")  # Too many partitions!
    .saveAsTable("curated.orders"))

# Optimize file sizes for Delta
spark.sql("""
    OPTIMIZE curated.orders
    ZORDER BY (customer_id)  -- Co-locate data for common join key
""")
```

### Query Optimization

```python
# Good: Predicate pushdown works
orders = spark.read.table("curated.orders").filter("order_date = '2024-01-15'")

# Bad: Predicate pushdown blocked by UDF
@udf(returnType=BooleanType())
def is_recent(date):
    return date > datetime.now() - timedelta(days=7)

orders = spark.read.table("curated.orders").filter(is_recent(F.col("order_date")))  # Full scan!

# Good: Use native functions instead
orders = spark.read.table("curated.orders").filter(
    F.col("order_date") > F.current_date() - F.expr("INTERVAL 7 DAYS")
)
```

### Caching Strategy

```python
def process_with_caching(spark: SparkSession) -> None:
    """
    Cache intermediate results that are reused multiple times.
    """
    # Read once, use multiple times
    base_orders = (
        spark.read.table("curated.orders")
        .filter("order_date >= '2024-01-01'")
        .cache()  # Cache in memory
    )
    
    try:
        # Multiple aggregations on same data
        daily_totals = base_orders.groupBy("order_date").agg(F.sum("total_amount"))
        customer_totals = base_orders.groupBy("customer_id").agg(F.sum("total_amount"))
        product_totals = base_orders.groupBy("product_id").agg(F.sum("total_amount"))
        
        # Write all outputs
        daily_totals.write.mode("overwrite").saveAsTable("marts.daily_totals")
        customer_totals.write.mode("overwrite").saveAsTable("marts.customer_totals")
        product_totals.write.mode("overwrite").saveAsTable("marts.product_totals")
    finally:
        base_orders.unpersist()  # Always clean up
```

### Cost Management

```sql
-- Monitor compute costs by pipeline
SELECT 
    pipeline_name,
    SUM(total_task_duration_ms) / 1000 / 60 as compute_minutes,
    SUM(bytes_spilled_to_disk) / 1e9 as disk_spill_gb,
    COUNT(*) as runs
FROM pipeline_metrics
WHERE run_date >= current_date - 7
GROUP BY pipeline_name
ORDER BY compute_minutes DESC;

-- Identify expensive queries
SELECT 
    query_hash,
    AVG(execution_time_ms) as avg_time_ms,
    AVG(bytes_scanned) / 1e9 as avg_gb_scanned,
    COUNT(*) as executions
FROM query_history
WHERE timestamp >= current_date - 7
GROUP BY query_hash
ORDER BY avg_gb_scanned DESC
LIMIT 20;
```

---

## Security & Governance

### PII Handling

```python
from cryptography.fernet import Fernet

class PIIHandler:
    """Handle PII data securely."""
    
    ENCRYPTION_KEY = os.environ["PII_ENCRYPTION_KEY"]
    
    PII_COLUMNS = {
        "email": "hash",      # One-way hash for matching
        "phone": "encrypt",   # Reversible encryption
        "ssn": "encrypt",
        "name": "tokenize",   # Replace with token
    }
    
    @classmethod
    def process_pii(cls, df: DataFrame) -> DataFrame:
        """Apply appropriate PII handling to each column."""
        for column, method in cls.PII_COLUMNS.items():
            if column in df.columns:
                if method == "hash":
                    df = df.withColumn(column, F.sha2(F.col(column), 256))
                elif method == "encrypt":
                    df = df.withColumn(column, cls._encrypt_udf(F.col(column)))
                elif method == "tokenize":
                    df = df.withColumn(column, cls._tokenize_udf(F.col(column)))
        return df
    
    @staticmethod
    @udf(returnType=StringType())
    def _encrypt_udf(value: str) -> Optional[str]:
        if value is None:
            return None
        cipher = Fernet(PIIHandler.ENCRYPTION_KEY.encode())
        return cipher.encrypt(value.encode()).decode()
```

### Row-Level Security

```sql
-- Create view with row-level security
CREATE OR REPLACE VIEW secure_views.orders AS
SELECT *
FROM curated.orders
WHERE 
    -- Admins see all
    IS_ACCOUNT_GROUP_MEMBER('data_admins')
    OR
    -- Regional managers see their region only
    (IS_ACCOUNT_GROUP_MEMBER('regional_managers') 
     AND region = CURRENT_USER_ATTRIBUTE('region'))
    OR
    -- Analysts see anonymized data only
    (IS_ACCOUNT_GROUP_MEMBER('analysts'));
```

### Audit Logging

```python
def log_data_access(
    user: str,
    table: str,
    operation: str,
    row_count: int,
    filters: dict,
) -> None:
    """
    Log all data access for compliance and security.
    """
    audit_record = {
        "timestamp": datetime.utcnow().isoformat(),
        "user": user,
        "table": table,
        "operation": operation,
        "row_count": row_count,
        "filters": json.dumps(filters),
        "client_ip": get_client_ip(),
        "session_id": get_session_id(),
    }
    
    spark.createDataFrame([audit_record]).write.mode("append").saveAsTable("audit.data_access_log")
```

### Data Classification

```python
DATA_CLASSIFICATION = {
    "public": {
        "description": "Non-sensitive, can be shared externally",
        "retention_days": None,
        "encryption": False,
    },
    "internal": {
        "description": "Business data, internal use only",
        "retention_days": 365 * 7,
        "encryption": False,
    },
    "confidential": {
        "description": "Sensitive business data",
        "retention_days": 365 * 3,
        "encryption": True,
    },
    "restricted": {
        "description": "PII, financial, or regulated data",
        "retention_days": 365,  # Or as required by regulation
        "encryption": True,
        "access_logging": True,
        "masking_required": True,
    },
}
```

---

## Observability

### Pipeline Metrics

```python
@dataclass
class PipelineMetrics:
    pipeline_name: str
    run_id: str
    start_time: datetime
    end_time: datetime
    status: str  # "success" | "failed" | "skipped"
    records_read: int
    records_written: int
    bytes_processed: int
    error_message: Optional[str] = None

def emit_metrics(metrics: PipelineMetrics) -> None:
    """Send metrics to monitoring system."""
    # To Prometheus/StatsD
    statsd.gauge(f"pipeline.duration_seconds.{metrics.pipeline_name}", 
                 (metrics.end_time - metrics.start_time).total_seconds())
    statsd.gauge(f"pipeline.records_written.{metrics.pipeline_name}", 
                 metrics.records_written)
    
    # To data catalog/lineage
    spark.createDataFrame([asdict(metrics)]).write.mode("append").saveAsTable("metrics.pipeline_runs")
```

### Alerting Rules

```yaml
# alerts.yaml
alerts:
  - name: pipeline_failure
    condition: status == "failed"
    severity: critical
    channels: [pagerduty, slack]
    message: "Pipeline {pipeline_name} failed: {error_message}"
  
  - name: data_freshness_sla
    condition: freshness_hours > sla_hours
    severity: high
    channels: [slack]
    message: "Table {table} is {freshness_hours}h stale (SLA: {sla_hours}h)"
  
  - name: volume_anomaly
    condition: abs(z_score) > 3
    severity: warning
    channels: [slack]
    message: "Unusual volume in {table}: {record_count} records (expected: {expected})"
  
  - name: cost_spike
    condition: daily_cost > 1.5 * avg_daily_cost
    severity: warning
    channels: [slack]
    message: "Cost spike detected: ${daily_cost} (avg: ${avg_daily_cost})"
```

---

## Definition of Done

A data pipeline is complete when:

### Functionality
- [ ] Pipeline produces correct output for all test cases
- [ ] Idempotency verified (re-run produces same result)
- [ ] Handles edge cases (nulls, empty batches, duplicates)
- [ ] Incremental logic works correctly
- [ ] Backfill capability tested

### Data Quality
- [ ] Schema documented and versioned
- [ ] Validation rules implemented
- [ ] Data quality checks pass
- [ ] Freshness SLA defined and monitored
- [ ] Anomaly detection configured

### Testing
- [ ] Unit tests for transformations (>80% coverage)
- [ ] Integration tests for end-to-end flow
- [ ] Data contract tests for schema
- [ ] Performance benchmarks documented

### Observability
- [ ] Logging implemented (start, end, errors, metrics)
- [ ] Metrics emitted to monitoring system
- [ ] Alerts configured for failures and SLA breaches
- [ ] Runbook/playbook documented

### Security & Compliance
- [ ] PII handled appropriately
- [ ] Access controls configured
- [ ] Audit logging enabled for sensitive data
- [ ] Retention policy applied

### Operations
- [ ] Pipeline registered in orchestrator
- [ ] Dependencies documented
- [ ] Recovery procedure tested
- [ ] Cost estimate documented

---

## Common Pitfalls

### 1. Non-Idempotent Pipelines

```python
# Bad: Appends every run, creates duplicates
df.write.mode("append").saveAsTable("target")

# Good: Delete-insert or merge for idempotency
spark.sql(f"DELETE FROM target WHERE date = '{execution_date}'")
df.write.mode("append").saveAsTable("target")
```

### 2. Ignoring Late-Arriving Data

```python
# Bad: Only process today's data
df.filter("event_date = current_date()")

# Good: Reprocess recent window for late arrivals
df.filter("event_date >= current_date() - INTERVAL 3 DAYS")
```

### 3. Schema Evolution Without Contracts

```python
# Bad: No schema enforcement
df.write.mode("overwrite").saveAsTable("output")

# Good: Enforce schema, fail on unexpected changes
df.write.option("mergeSchema", "false").mode("overwrite").saveAsTable("output")
```

### 4. Missing Partition Pruning

```sql
-- Bad: Filter on derived column prevents pruning
SELECT * FROM orders WHERE YEAR(order_date) = 2024

-- Good: Filter directly on partition column
SELECT * FROM orders WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01'
```

### 5. Inadequate Testing

```python
# Bad: Only happy path
def test_pipeline():
    result = run_pipeline(sample_data)
    assert result.count() > 0

# Good: Test edge cases
def test_pipeline_handles_nulls(): ...
def test_pipeline_handles_duplicates(): ...
def test_pipeline_handles_empty_input(): ...
def test_pipeline_is_idempotent(): ...
```

---

## Resources

- [Delta Lake Documentation](https://docs.delta.io/)
- [Apache Spark Best Practices](https://spark.apache.org/docs/latest/sql-performance-tuning.html)
- [DBT Best Practices](https://docs.getdbt.com/guides/best-practices)
- [Great Expectations](https://docs.greatexpectations.io/)
- [Data Engineering Patterns](https://www.dedp.online/)
- [The Data Warehouse Toolkit (Kimball)](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/)
