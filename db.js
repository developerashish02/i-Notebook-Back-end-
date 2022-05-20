const mongoose = require("mongoose");

const mongooseURI =
	"mongodb://localhost:27017/inotebooks?directConnection=true";

const connectToMongo = async () => {
	mongoose.connect(mongooseURI, () => {
		console.log("connected to mongo");
	});
};

module.exports = connectToMongo;
