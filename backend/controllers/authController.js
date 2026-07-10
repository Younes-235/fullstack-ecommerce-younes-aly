const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../config/db"); 

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`🔑 Login attempt for: ${email}`);

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const cleanEmail = email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
            where: { email: cleanEmail }
        });

        if (!user) {
            console.log("❌ Login failed: Email not found in database.");
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("❌ Login failed: Password hash mismatch.");
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "24h" }
        );

        console.log("✅ Login successful! Token generated.");
        return res.status(200).json({ message: "Logged in successfully", token });

    } catch (error) {
        console.error("💥 Login Controller Crash:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const cleanEmail = email.toLowerCase().trim();

        const existingUser = await prisma.user.findUnique({
            where: { email: cleanEmail }
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: "This email address is already registered. Please log in instead." 
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await prisma.user.create({
            data: {
                email: cleanEmail,
                password: hashedPassword,
                role: role || "USER"
            }
        });
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "24h" }
        );

        return res.status(201).json({ message: "User registered successfully", token });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "An unexpected error occurred during registration" });
    }
};   