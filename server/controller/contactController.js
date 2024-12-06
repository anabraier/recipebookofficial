const page = async (req, res) => {
  try {
    res.render('contact', { title: "Contact Page", message: 'Contact Page' } );
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occurred" });
  }
};

module.exports = page;