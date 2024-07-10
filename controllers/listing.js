const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async(req,res) => {
    const allListings= await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm = (req,res) => {  
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
             .populate({
                path:"reviews",
                populate: {
                    path: "author",
                },
            })
             .populate("owner");
    
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }

    console.log(listing);
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req,res,next) => {
    try {
        let response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
          })
            .send();
            
        // console.log(response.body.features[0].geometry);
        // res.send("done");    
        if(!response.body.features.length) {
            req.flash("error", "Location not found");
            return res.redirect("/listings")
        }
    
        let url = req.file.path;
        let filename = req.file.filename;
        // console.log(url,"..",filename);
    
        // let {title, description, image, price,country,location} = req.body;
        const newListing = new Listing(req.body.listing);
        // console.log(req.user);
    
        newListing.owner = req.user._id;
        newListing.image = {url, filename};
        newListing.geometry = response.body.features[0].geometry;
    
        let savedListing = await newListing.save();
        console.log(savedListing);
        req.flash("success", "New Listing Created:");
        res.redirect("/listings");
    } catch(err) {
        console.error('Error creating listing:', err);
        req.flash('error', 'Could not create listing');
        res.redirect('/listings');
    }
};

module.exports.editRenderForm = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl= originalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing = async(req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
   
    // const updatedData = req.body.listing;

    // // Update the image URL if provided
    // if (updatedData.image && updatedData.image.url && updatedData.image.url.trim() !== "") {
    //     listing.image.url = updatedData.image.url;
    // }

    // // Update other fields except image
    // for (const key in updatedData) {
    //     if (key !== "image") {
    //         listing[key] = updatedData[key];
    //     }
    // }
    
    if(typeof req.file!="undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    // Save the updated listing
    await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async(req,res) => {
    let {id} = req.params;
    let deletedListing  = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};