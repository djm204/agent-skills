// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "AgenticTeamTemplates",
    platforms: [.macOS(.v10_15)],
    products: [
        .library(name: "AgenticTeamTemplates", targets: ["AgenticTeamTemplates"]),
    ],
    targets: [
        .target(
            name: "AgenticTeamTemplates",
            path: "Sources/AgenticTeamTemplates",
            resources: [.copy("templates")]
        ),
    ]
)
