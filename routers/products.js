const express = require("express");
const { model } = require("mongoose");
const router = express.Router();
const { Product } = require("../models/product");
const { Category } = require("../models/category");
const mongoose = require("mongoose");
const multer = require("multer");

const FILE_TYPE = {
  "image/jpg": "jpg",
  "image/png": "png",
  "image/jpeg": "jpeg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE[file.mimetype];
    let error = new Error("Invalid type");
    if (isValid) {
      error = null;
    }
    cb(error, "./public/images");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE[file.mimetype];

    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const upload = multer({ storage: storage });

router.get(`/getProductList`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter).populate("category");
  if (!productList) {
    res.status(500).json({
      success: false,
    });
  }
//   res.send(productList);
res.status(200).json({
    success: true,
    productList
  });
});
router.get(`/searchProduct`, async (req, res) => {
    
    let filter = req.query.search ? req.query.search :'';
    var regex = RegExp("/.*" + filter + ".*/")


    const productList = await Product.find({name: new RegExp('.*' + filter + '.*','i')});
    if (!productList) {
      res.status(500).json({
        success: false,
      });
    }
  //   res.send(productList);
  res.status(200).json({
      success: true,
      productList
    });
  });
router.get(`/getProduct/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    res.status(500).json({
      success: false,
    });
  }
//   res.send(product);
res.status(200).json({success: true, product})
});

router.post(`/createProducts`, upload.single("image"), async (req, res) => {
  console.log(111,req.body)
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).json({
      message: "Invalid category",
      success: false
    });
  }

  const file = req.file;
  if (!file) {
    return res.status(400).json({
      message: "Invalid image",
      success: false
    });
  }
  const fileName = req.file.filename;
  const imagePath = `${req.protocol}://${req.get("host")}/public/images/`;
  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${imagePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();
  if (!product) {
    return res.status(400).json({
        success: false,
      message: "Product cannot be created",
    });
  } else {
    return  res.status(200).json({
        success: true,
    //   message: "Product cannot be created",
    product
    });
  }
});

router.put("/updateProduct/:id", upload.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Product ID");
  }

  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send({
      message: "Invalid category",
      success: false
    });
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(400).send({
      message: "Invalid product",
      success: false
    });
  }

  const file = req.file;
  let path;
  if (file) {
    const fileName = req.file.filename;
    const imagePath = `${req.protocol}://${req.get("host")}/public/images/`;
    path = `${imagePath}${fileName}`;
  } else {
    path = product.image;
  }
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: path,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );
  if (!updatedProduct) {
    return res.status(500).json({
        success: false,
        message: 'Product cannot be updated'
    });
  } else {
    res.status(200).json({
        success: true,
        updatedProduct
    });
  }
});

router.delete("/deleteProduct/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res.status(200).json({
          success: true,
          message: "The product is deleted",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
    })
    .catch((err) => {
      return res.status(400).json({
        success: false,
        error: err,
      });
    });
});

//totalProduct
router.get("/getProducts/count", async (req, res) => {
  const productCount = await Product.countDocuments((count) => {
    count;
  });
  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.json({
    count: productCount,
    success: true
  });
});

router.get("/get/featured/:count", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const featuredProduct = await Product.find({
    isFeatured: true,
  }).limit(+count);
  if (!featuredProduct) {
    res.status(500).json({ success: false });
  }
  res.json({
    count: featuredProduct,
    success: true
  });
});

router.put(
  "/updateImages/:id",
  upload.array('images', 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send("Invalid Product ID");
    }
    let imagePaths = [];
    const imageUrl = `${req.protocol}://${req.get("host")}/public/images/`;

    const files = req.files;
    if (files) {
      files.map((file) => {imagePaths.push(`${imageUrl}${file.filename}`)});
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      {
        images: imagePaths,
      },
      { new: true } 
    );
    if (!product) {
      return res.status(500).send("The images cannot be updated");
    } else {
    //   res.status(200).send(product);
    res.status(200).json({
        success: true,
        product
    })
    }
  }
);


module.exports = router;
