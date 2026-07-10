const prisma = require('../config/db.js');
const {createClient} = require("@supabase/supabase-js");
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

exports.getAllProducts = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, sortBy, order, page, limit } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 8;
        const skip = (pageNum - 1) * limitNum;

        const whereClause = {};

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (category) {
            whereClause.category = category; 
        }

        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) whereClause.price.gte = parseFloat(minPrice);
            if (maxPrice) whereClause.price.lte = parseFloat(maxPrice);
        }

        const orderBy = {};
        if (sortBy) {
            orderBy[sortBy] = order === 'desc' ? 'desc' : 'asc';
        } else {
            orderBy.createdAt = 'desc';
        }

        const [products, totalCount] = await prisma.$transaction([
            prisma.product.findMany({
                where: whereClause,
                orderBy: orderBy,
                skip: skip,
                take: limitNum,
            }),
            prisma.product.count({ where: whereClause })
        ]);

        res.status(200).json({
            meta: {
                totalCount,
                totalPages: Math.ceil(totalCount / limitNum),
                currentPage: pageNum,
                limit: limitNum
            },
            data: products
        });
    } catch (error) {
        console.error("Error in getProducts:", error);
        res.status(500).json({ error: "Failed to retrieve filtered products" });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const distinctProducts = await prisma.product.findMany({
            select: { category: true },
            distinct: ['category'],
        });

        const cleanCategoriesList = distinctProducts.map(p => p.category);
        
        res.status(200).json(cleanCategoriesList);
    } catch (error) {
        console.error("Error in getCategories:", error);
        res.status(500).json({ error: "Failed to fetch category lists." });
    }
};
// //GET api/products/:id

exports.getProductById = async (req, res) => {
    try{
        const product = await prisma.product.findUnique({
            where: {id: parseInt(req.params.id)}
        });
        if(!product){
            return res.status(404).json({error: "Product not found"});
        }
        else{
            res.status(200).json(product);
        }
    } catch(error){
        res.status(500).json({error: "Error retrieving product"});
    }
}

// // POST api/products
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        let imageUrl = null;

        if (req.file) {
            const fileName = `${Date.now()}-${req.file.originalname}`;

            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: true
                });

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName);

            imageUrl = publicUrlData.publicUrl;
        }

        const newProduct = await prisma.product.create({
            data: {
                name, 
                description,
                price: parseFloat(price),
                category,
                stock: parseInt(stock),
                imageUrl 
            }
        });
        
        res.status(201).json({ message: "Product added successfully", product: newProduct });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Failed to create product. Check your fields." });
    }
};
