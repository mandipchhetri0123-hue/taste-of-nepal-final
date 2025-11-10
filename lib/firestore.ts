import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// ✅ define and export the type once
export type MenuItem = {
  id: string;
  name: string;
  category: "standard" | "premium" | "deluxe";
  price: number;
  description: string;
  imageUrl: string;
};

// ✅ export the function that fetches from Firestore
export async function fetchMenu(): Promise<MenuItem[]> {
  try {
    const menuRef = collection(db, "menu");
    const snapshot = await getDocs(menuRef);

    const menuItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<MenuItem, "id">),
    }));

    return menuItems;
  } catch (error) {
    console.error("Error fetching menu:", error);
    return [];
  }
}

