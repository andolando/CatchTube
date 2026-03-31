import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()
import authRoutes from './routes/authRoutes.js'
import { sessionMiddleware } from './config/session.js'
import passport from './config/passport.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(sessionMiddleware)
app.use(passport.initialize())
app.use(passport.session())

app.use('/auth', authRoutes)

const PORT = process.env.PORT || 5050

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})