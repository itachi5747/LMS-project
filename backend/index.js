const express = require('express')
const app = express()
const cookieParser = require('cookie-parser');
const cors = require('cors')

app.use(cookieParser());

app.use(express.json());
// app.use(cors({origin : "http://localhost:5173", credentials : true}))
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
require("dotenv").config()
require('./config/database').connect()
const authRoutes = require('./routes/auth.route')
const teacherRoutes = require('./routes/teacher.route')
app.use("/app/v1/", authRoutes)
app.use("/app/v1/", teacherRoutes)
const PORT = 3000 || 5000
app.listen(PORT, () => {
    console.log(`app is running at ${PORT}`);
})
