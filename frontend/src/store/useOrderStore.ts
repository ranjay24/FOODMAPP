import { CheckoutSessionRequest, OrderState } from "@/types/orderType";
import axios from "axios";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const API_END_POINT: string = "http://localhost:8000/api/v1/order";
axios.defaults.withCredentials = true;

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      loading: false,
      orders: [],

      // Create a checkout session
      createCheckoutSession: async (checkoutSession: CheckoutSessionRequest) => {
        try {
          set({ loading: true });
          const response = await axios.post(
            `${API_END_POINT}/checkout/create-checkout-session`,
            checkoutSession,
            {
              headers: {
                "Content-Type": "application/json",
              }
            }
          );
          window.location.href = response.data.session.url;
          set({ loading: false });
        } catch (error) {
          set({ loading: false });
        }
      },

      // Fetch order details
      getOrderDetails: async () => {
        try {
          set({ loading: true });
          const response = await axios.get(`${API_END_POINT}/`);
          set({ loading: false, orders: response.data.orders });
        } catch (error) {
          set({ loading: false });
        }
      },

      // Assign delivery boy to an order
      assignDeliveryBoyToOrder: async (orderId: string, deliveryBoyId: string) => {
        try {
          set({ loading: true });
          const response = await axios.post(
            `http://localhost:8000/api/v1/deliveryboy/assign/${orderId}`,
            { deliveryBoyId },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          set((state) => ({
            loading: false,
            orders: state.orders.map((order) =>
              order._id === orderId
                ? { ...order, deliveryBoyId: response.data.deliveryBoyId }
                : order
            ),
          }));
          return response.data.order; // Return the updated order if needed
        } catch (error) {
          console.error("Failed to assign delivery boy:", error);
          set({ loading: false });
          throw error; // Re-throw the error for further handling
        }
      },
    }),
    {
      name: "order-name",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
