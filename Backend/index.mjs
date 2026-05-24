import {start} from "bfast-function";


// Start the serverless engine
start({
    port: 3003,
    mode: "local",
    functionsConfig: {
        bfastJsonPath: "./bfast.json",
        functionsDirPath: "./VehicleAndFleetTelemetryModule/Presentation",
        assets: "./Assets",
    }
}).catch(err => console.log(err));
