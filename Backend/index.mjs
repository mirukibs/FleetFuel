import {start} from "bfast-function";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const backendRoot = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT ?? 3003;

// Start the serverless engine
start({
    port,
    mode: "local",
    functionsConfig: {
        bfastJsonPath: join(backendRoot, "bfast.json"),
        functionsDirPath: join(backendRoot, "VehicleAndFleetTelemetryModule/Presentation"),
        assets: join(backendRoot, "Assets"),
    }
}).catch(err => console.log(err));
