import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

const getMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    console.log("Error fetching restaurant", error);
    res.status(500).json({ message: "Error fetching restaurant" });
  }
};

const createMyRestaurant = async (req: Request, res: Response) => {
  try {
    const existingRestaurant = await Restaurant.findOne({ user: req.userId });

    if (existingRestaurant) {
      return res.status(409).json({ message: "User restaurant already exists" });
    }

    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    const restaurant = new Restaurant(req.body);
    restaurant.imageUrl = imageUrl;
    restaurant.user = new mongoose.Types.ObjectId(req.userId);
    restaurant.lastUpdated = new Date();
    await restaurant.save();

    res.status(201).send(restaurant);
  } catch (error) {
    console.log("Error creating restaurant", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });

    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }

    // Update fields only if they are provided in the request
    restaurant.restaurantName = req.body.restaurantName || restaurant.restaurantName;
    restaurant.city = req.body.city || restaurant.city;
    restaurant.country = req.body.country || restaurant.country;
    restaurant.deliveryPrice = req.body.deliveryPrice || restaurant.deliveryPrice;
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime || restaurant.estimatedDeliveryTime;
    restaurant.cuisines = req.body.cuisines || restaurant.cuisines;
    restaurant.menuItems = req.body.menuItems || restaurant.menuItems;
    restaurant.lastUpdated = new Date();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      restaurant.imageUrl = imageUrl;
    }

    await restaurant.save();
    res.status(200).send(restaurant);
  } catch (error) {
    console.log("Error updating restaurant", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const uploadImage = async (file: Express.Multer.File): Promise<string> => {
  try {
    const base64Image = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${base64Image}`;
    const uploadResponse = await cloudinary.uploader.upload(dataURI);
    return uploadResponse.url;
  } catch (error) {
    console.log("Error uploading image", error);
    throw new Error("Image upload failed");
  }
};

export default {
  getMyRestaurant,
  createMyRestaurant,
  updateMyRestaurant,
};
