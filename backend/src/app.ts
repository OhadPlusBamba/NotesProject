import "dotenv/config";
import express , {NextFunction, Request ,Response} from "express";
// import note from "./models/note";
import noteRoutes from "./routes/notes";
import userRoutes from "./routes/users";
import morgan from "morgan";
import createHttpError , {isHttpError }from "http-errors";
import session from "express-session";
import env from "./util/validatelEnv";
import MongoseStore from "connect-mongo";
import { requiresAuth } from "./middleware/auth";

const app = express();

app.use(morgan("dev"));

app.use(express.json());

app.use(session({
    secret: env.SESSION_SECRET,
    resave:false,
    saveUninitialized: false,
    cookie:{
        maxAge: 60*60*1000,

    },
    rolling: true,
    store: MongoseStore.create({
        mongoUrl: env.MONGO_CONNECTION_STRING
    }),
}));

app.use("/api/users",userRoutes);
app.use("/api/notes" ,requiresAuth ,noteRoutes);


app.use((req,res,next) => {
    next(createHttpError(404, "Endpoint not found"));
});


// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error:unknown, req: Request , res: Response , next:NextFunction)=> {
    console.log(error);
    let errorMessage = "an unknown error occurred";
    let statusCode = 500;
    if(isHttpError(error)){
        statusCode = error.status;
        errorMessage = error.message;
    }
    res.status(500).json({error:errorMessage});
});


export default app;

