const {Router} = require('express');
const router = Router();
const path = require("path")
const multer  = require('multer')
const Blog = require('../models/blog')
const Comment = require('../models/comment')



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/uploads/`))
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}- ${file.originalname}`

    
      cb(null, fileName)
    }
  })

  const upload = multer({ storage: storage })

  router.get('/add-new', (req, res)=>{
    return res.render('addblog',{
        user: req.user,
    })
})




router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  const blog = await Blog.create({
    body,
    title,
    createdBy: req.user,
    coverImageURL: `/uploads/${req.file.filename}`,
  });
  return res.redirect(`/blog/${blog._id}`);
});

router.post('/update/:blogid', upload.single("coverImage"), async (req, res) => {
  try {
    const { title, body } = req.body;
    const blogId = req.params.blogid;

    const updateData = {
      title,
      body,
      createdBy: req.user,
    };

    // Only update coverImageURL if a file is uploaded
    if (req.file) {
      updateData.coverImageURL = `/uploads/${req.file.filename}`;
    }

    const blog = await Blog.findByIdAndUpdate(blogId, updateData, { new: true });

    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    res.redirect('/');
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).send("Internal Server Error");
  }
});


router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});


router.get('/:id', async(req, res) =>{
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );
  return res.render('blog', {
    user: req.user,
    blog,
    comments,
  })

})


router.get('/delete/:id', async (req, res) =>{
  const del = await Blog.findByIdAndDelete(req.params.id);
  res.redirect('/')
})


router.get('/edit/:Blogid', async (req, res) =>{
  const blog = await Blog.findById(req.params.Blogid);
  res.render('edit', {blog})

})

module.exports = router;