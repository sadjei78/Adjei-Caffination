import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Define types
interface Order {
    id: string;
    customerId: string;
    drinkName: string;
    customerName: string;
    seatingLocation: string;
    specialInstructions?: string;
    toppings?: string[];
    orderStatus: 'New' | 'Brewing' | 'On Hold' | 'Delivered' | 'Cancelled';
    timestamp: string;
}

interface OrderStatusUpdate {
    orderStatus: Order['orderStatus'];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const ORDERS_FILE = join(__dirname, 'data', 'orders.json');

// Get order stats
const getOrderStats = (orders: Order[]) => ({
    total: orders.length,
    new: orders.filter(o => o.orderStatus === 'New').length,
    brewing: orders.filter(o => o.orderStatus === 'Brewing').length,
    completed: orders.filter(o => o.orderStatus === 'Delivered').length,
    cancelled: orders.filter(o => o.orderStatus === 'Cancelled').length
});

// Ensure data directory and file exist
async function initializeDataFile() {
    try {
        await fs.mkdir(join(__dirname, 'data'), { recursive: true });
        try {
            await fs.access(ORDERS_FILE);
        } catch {
            await fs.writeFile(ORDERS_FILE, JSON.stringify([]));
        }
    } catch (error) {
        console.error('Error initializing data file:', error);
    }
}

// Initialize the server
const initializeServer = async () => {
    await initializeDataFile();

    // Add stats endpoint
    app.get('/api/stats', async (_req: Request<{}, any, any, any>, res: Response<any>) => {
        try {
            const data = await fs.readFile(ORDERS_FILE, 'utf8');
            const orders: Order[] = JSON.parse(data);
            res.json(getOrderStats(orders));
        } catch (error) {
            res.status(500).json({ error: 'Error getting stats' });
        }
    });

    // Get all orders
    app.get('/api/orders', async (_req: Request<{}, any, any, any>, res: Response<any>) => {
        try {
            const data = await fs.readFile(ORDERS_FILE, 'utf8');
            const orders: Order[] = JSON.parse(data);
            res.json(orders);
        } catch (error) {
            res.status(500).json({ error: 'Error reading orders' });
        }
    });

    // Get orders by customer ID
    app.get('/api/orders/:customerId', async (req: Request<{ customerId: string }, any, any, any>, res: Response<any>) => {
        try {
            const data = await fs.readFile(ORDERS_FILE, 'utf8');
            const orders: Order[] = JSON.parse(data);
            const customerOrders = orders.filter(
                (order) => order.customerId === req.params.customerId
            );
            res.json(customerOrders);
        } catch (error) {
            res.status(500).json({ error: 'Error reading orders' });
        }
    });

    // Save new order
    app.post('/api/orders', async (req: Request<{}, any, Omit<Order, 'id' | 'timestamp'>, any>, res: Response<any>) => {
        try {
            const data = await fs.readFile(ORDERS_FILE, 'utf8');
            const orders: Order[] = JSON.parse(data);
            const newOrder: Order = {
                ...req.body,
                id: uuidv4(),
                timestamp: new Date().toISOString()
            };
            orders.push(newOrder);
            await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
            res.json(newOrder);
        } catch (error) {
            res.status(500).json({ error: 'Error saving order' });
        }
    });

    // Update order status
    app.patch('/api/orders/:orderId', (async (
        req: Request<{ orderId: string }, any, OrderStatusUpdate>,
        res: Response
    ) => {
        try {
            const data = await fs.readFile(ORDERS_FILE, 'utf8');
            const orders: Order[] = JSON.parse(data);
            const orderIndex = orders.findIndex((o) => o.id === req.params.orderId);
            
            if (orderIndex === -1) {
                return res.status(404).json({ error: 'Order not found' });
            }

            orders[orderIndex] = { ...orders[orderIndex], ...req.body };
            await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
            res.json(orders[orderIndex]);
        } catch (error) {
            res.status(500).json({ error: 'Error updating order' });
        }
    }) as RequestHandler<{ orderId: string }, any, OrderStatusUpdate>);

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

// Start the server
initializeServer().catch(error => {
    console.error('Failed to initialize server:', error);
    process.exit(1);
});