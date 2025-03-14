import { collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  id: string;
}

export interface ShippingDetails {
  address: string;
  city: string;
  postalCode: string;
  name: string;
  email: string;
  phone: string;
  method: 'shipping' | 'pickup';
}

export interface Order {
  id: string;
  reference: string;
  userId: string;
  email: string;
  items: OrderItem[];
  total: number;
  shipping: ShippingDetails;
  status: 'created' | 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const COLLECTION_NAME = 'orders';

export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const orderWithTimestamps = {
      ...orderData,
      createdAt: now,
      updatedAt: now,
    };

    // Use the reference as the document ID
    await setDoc(doc(db, COLLECTION_NAME, orderData.reference), orderWithTimestamps);
    
    // Send webhook to Make.com for order creation
    try {
      await fetch('https://hook.eu2.make.com/cpw4ynt56urvf97eb2l9ap1rsm67hef2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ORDER_CREATED',
          order: orderWithTimestamps,
        }),
      });
    } catch (webhookError) {
      console.error('Error sending webhook:', webhookError);
      // Don't throw here - we still want to return the order reference
    }

    return orderData.reference;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (reference: string, status: Order['status']): Promise<void> => {
  try {
    const orderRef = doc(db, COLLECTION_NAME, reference);
    await updateDoc(orderRef, {
      status,
      updatedAt: new Date().toISOString()
    });

    // Send webhook to Make.com for status update
    try {
      await fetch('https://hook.eu2.make.com/cpw4ynt56urvf97eb2l9ap1rsm67hef2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ORDER_STATUS_UPDATED',
          reference,
          status,
        }),
      });
    } catch (webhookError) {
      console.error('Error sending webhook:', webhookError);
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const getOrderByReference = async (reference: string): Promise<Order | null> => {
  try {
    const orderRef = doc(db, COLLECTION_NAME, reference);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      return { id: orderSnap.id, ...orderSnap.data() } as Order;
    }
    return null;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Export both function names for backward compatibility
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

// Add alias for backward compatibility
export const fetchUserOrders = getUserOrders;