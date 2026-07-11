const express = require("express");
const router = express.Router();
const Address = require("../models/Address");

// Get user addresses
router.get("/:userId", async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.params.userId });
        res.json(addresses);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Add new address
router.post("/", async (req, res) => {
    try {
        const address = await Address.create(req.body);
        res.status(201).json(address);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// Update address
router.put("/:id", async (req, res) => {
    try {
        const address = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(address);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;