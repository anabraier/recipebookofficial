const page = async (req, res) => {
  try {
    res.render('about', { title: "About Page", message: 'About Page' } );
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
};

module.exports = page;