const crypto = require("crypto");

exports.generatePayment = async (req, res) => {

    try {

        const {

            orderId,
            amount,
            firstName,
            lastName,
            email,
            phone,
            address,
            city

        } = req.body;

        const merchantId = process.env.PAYHERE_MERCHANT_ID;
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

        const currency = "LKR";

        const hashedSecret = crypto
            .createHash("md5")
            .update(merchantSecret)
            .digest("hex")
            .toUpperCase();

        const hash = crypto
            .createHash("md5")
            .update(
                merchantId +
                orderId +
                amount +
                currency +
                hashedSecret
            )
            .digest("hex")
            .toUpperCase();

        res.json({

            merchant_id: merchantId,

            return_url:
                "http://localhost:5173/payment-success",
            cancel_url:
                "http://localhost:5173/payment-cancel",
            notify_url:
                "http://localhost:5000/api/payment/notify",
            order_id: orderId,
            items: "QuickRent Booking",
            currency,
            amount,
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            address,
            city,
            country: "Sri Lanka",
            hash
        });
    }

    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Payment Error"
        });
    }

};