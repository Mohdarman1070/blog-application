require("dotenv").config();

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;
const path = require('path')
const mongoose = require('mongoose')
const cookiePaser = require('cookie-parser');


const Blog = require("./models/blog");

const { checkForauthenticationCookie, } = require('./middleware/authentication');
app.set('view engine',  'ejs');
app.set('views', path.resolve("./views"))

mongoose.connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));


app.use(cookiePaser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.resolve("./public")));
app.use(checkForauthenticationCookie('token'))


const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');

app.use('/user', userRoute)

app.use('/blog', blogRoute)




app.get('/', async (req, res) =>{
    const allBlogs = await Blog.find({})
     res.render('home', {
        user : req.user,
        blogs: allBlogs,

    })
})


app.listen(PORT, ()=>{
    console.log(`Server started running at ${PORT}`)

})
