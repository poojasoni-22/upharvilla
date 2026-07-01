export interface OrderItemDisplay {
  orderId: string;
  itemId: string;
  item: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    thumbnail?: string;
  };
  orderItems: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    thumbnail?: string;
  }[];
  totalAmount: number;
  createdAt: number;
  orderStatus:
    | "placed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  paymentStatus: "paid" | "pending" | "failed";
  razorpayOrderId?: string;
  address?: any;
  shippedAt?: number;
  outForDeliveryAt?: number;
  deliveredAt?: number;
  review?: any;
}
