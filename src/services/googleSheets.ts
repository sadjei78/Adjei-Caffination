import axios from 'axios';
import { DrinkItem, Topping } from '../types/types';

const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
if (!SPREADSHEET_ID) {
    throw new Error('Google Sheet ID not configured in environment variables');
}

const MENU_SHEET = 'Menu';
const TOPPINGS_SHEET = 'Toppings';

export const fetchDrinkMenu = async (): Promise<DrinkItem[]> => {
    try {
        const response = await axios.get(
            `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${MENU_SHEET}`
        );
        
        const jsonStr = response.data.substring(47).slice(0, -2);
        const json = JSON.parse(jsonStr);
        
        return json.table.rows.map((row: any) => ({
            id: row.c[0]?.v?.toString() || '',
            name: row.c[1]?.v || '',
            price: typeof row.c[2]?.v === 'string' 
                ? Number(row.c[2].v.replace('$', '')) 
                : Number(row.c[2]?.v) || 0,
            description: row.c[3]?.v || '',
            temperature: row.c[4]?.v?.toString().toLowerCase() || 'warm'
        })).filter((drink: DrinkItem) => drink.id && drink.name);
    } catch (error) {
        console.error('Failed to fetch menu:', error);
        throw error; // Let the caller handle the error
    }
};

export const fetchToppings = async (): Promise<Topping[]> => {
    try {
        const response = await axios.get(
            `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${TOPPINGS_SHEET}`
        );
        
        const jsonStr = response.data.substring(47).slice(0, -2);
        const json = JSON.parse(jsonStr);
        
        return json.table.rows.map((row: any) => ({
            id: row.c[0]?.v?.toString() || '',
            name: row.c[1]?.v || '',
            price: typeof row.c[2]?.v === 'string' 
                ? Number(row.c[2].v.replace('$', '')) 
                : Number(row.c[2]?.v) || 0
        })).filter((topping: Topping) => topping.id && topping.name);
    } catch (error) {
        console.error('Error fetching toppings:', error);
        return [];
    }
}; 