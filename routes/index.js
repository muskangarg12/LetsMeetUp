const { ip } = require("../models");

module.exports = (io) => {
    const route = require("express").Router();

    // Get Route for Home Page
    route.get("/", (req, res) => {
        res.render("index", {
            success: req.flash("success"),
            error: req.flash("error")
        });
    });

    route.post("/ip", async (req, res) => {
        console.log(req.body);
        let newIp = await ip.create({ ip: req.body.ip });
        await newIp.save();
        res.send("success");
    })

    route.use("/", require("./auth"));
    route.use("/chats", require("./chats")(io));
    route.use("/rooms", require("./rooms"));
   
    // Redirect to Home Page if Request for a non-existing Page
    route.get("*", (req, res) => {
        req.flash("error", "Page does not exist!!");
        res.redirect("/");
    });

    return route;
};
