import crypto from "crypto";

// ✅ LIVE ENVIRONMENT
const merchantId = "236e6378d80e49123456789rt65432";
const secretKey = "dca86ef26e4f423sdfger8765432345";
const apiUrl = "https://api.zaakpay.com/api/paymentTransact/V8";

// ✅ STAGING ENVIRONMENT (use only for test)
// const merchantId = "236e6378d80e49123456789rt65432";
// const secretKey = "dca86ef26e4f423sdfger8765432345";
// const apiUrl = "https://zaakstaging.zaakpay.com/api/paymentTransact/V8";

const generateZaakpayChecksum = (data, key) => {
  // Step 1: Sort and filter only non-empty parameters
  const sortedKeys = Object.keys(data)
    .filter(k => data[k] !== undefined && data[k] !== "")
    .sort();

  // Step 2: Build string in key=value&key2=value2 format
  const plainText = sortedKeys.map(k => `${k}=${data[k]}`).join("&");

  // Step 3: Generate HMAC SHA-256 hash using secret key
  const checksum = crypto.createHmac("sha256", key).update(plainText).digest("hex");

  console.log("🔹 Checksum String Used:", plainText);
  console.log("🔹 Generated Checksum:", checksum);

  return checksum;
};

export const zaakpayPayin = async (req, res) => {
  try {
    const { amount, email } = req.body;

    const amountInPaise = (amount * 100).toString();

    const params = {
      amount: amountInPaise,
      buyerFirstName: "Rahul",
      buyerEmail: email,
      currency: "INR",
      merchantIdentifier: merchantId,
      orderId: `ZAAK${Date.now()}`,
      productDescription: "Test Transaction",
      returnUrl: "https://jajamblockprints.com/api/status",
    };

    // ✅ Generate checksum
    const checksum = generateZaakpayChecksum(params, secretKey);

    // ✅ Build query string
    const queryString = Object.entries({ ...params, checksum })
      .map(([k, v]) => {
        if (k === "buyerEmail") return `${k}=${v}`; // 👈 keep @ as is
        return `${k}=${encodeURIComponent(v)}`;
      })
      .join("&");

    const paymentUrl = `${apiUrl}?${queryString}`;

    return res.json({
      success: true,
      message: "Zaakpay payment URL generated successfully",
      paymentUrl,
    });
  } catch (error) {
    console.error("Zaakpay Error:", error);
    return res.status(500).json({
      success: false,
      message: "Zaakpay integration failed",
      error: error.message,
    });
  }
};

export const zaakpayCallback = async (req, res) => {
  try {
    const response = req.body;
    console.log("✅ Zaakpay Callback Response:", response);

    const receivedChecksum = response.checksum;
    delete response.checksum;

    const calculatedChecksum = generateZaakpayChecksum(response, secretKey);

    if (receivedChecksum === calculatedChecksum) {
      console.log("✅ Checksum verified successfully");

      if (response.responseCode === "100") {
        console.log("🎉 Payment Successful for Order:", response.orderId);
      } else {
        console.log("❌ Payment Failed for Order:", response.orderId);
      }

      return res.send(`<h3>Payment status updated successfully.</h3>`);
    } else {
      console.log("❌ Invalid checksum received in callback");
      return res.status(400).send("Invalid checksum received.");
    }
  } catch (error) {
    console.error("Callback Error:", error);
    res.status(500).send("Internal Server Error in Callback");
  }
};