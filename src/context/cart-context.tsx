
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "@/types/product";
import { validateCartInventory } from "@/app/cart/actions";

export type CartItem = Product & {
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isReady: boolean;
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  refreshInventory: () => Promise<boolean>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "rubys-shopping-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEY);

      if (savedCart) {
        const parsedCart: unknown = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          const validItems: CartItem[] = parsedCart
            .filter(
              (item): item is CartItem =>
                item !== null &&
                typeof item === "object" &&
                typeof item.id === "string" &&
                typeof item.name === "string" &&
                typeof item.price === "number" &&
                typeof item.quantity === "number" &&
                typeof item.stockQuantity === "number" &&
                item.quantity > 0 &&
                item.isActive === true &&
                item.isArchived !== true
            )
            .map((item) => ({
              ...item,
              quantity: Math.floor(item.quantity),
            }));

          // eslint-disable-next-line react-hooks/set-state-in-effect
          setItems(validItems);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (isReady) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isReady]);

  const refreshInventory = useCallback(async (): Promise<boolean> => {
    try {
      const result = await validateCartInventory(
        items.map((item) => ({
          productId: item.id,
        }))
      );

      if (!result.success) {
        return false;
      }

      const liveProducts = new Map(
        result.products.map((product) => [product.id, product])
      );

      const missingIds = new Set(result.missingProductIds);

      setItems((currentItems) =>
        currentItems
          .filter((item) => !missingIds.has(item.id))
          .map((item) => {
            const liveProduct = liveProducts.get(item.id);

            if (!liveProduct) {
              return item;
            }

            const currentStock = liveProduct.stockQuantity;

            return {
              ...item,
              price: liveProduct.price,
              stockQuantity: currentStock,
              isActive: liveProduct.isActive,
              isArchived: liveProduct.isArchived,
              quantity: Math.min(item.quantity, currentStock),
            };
          })
      );

      return true;
    } catch (error) {
      console.error("RUBYS cart inventory refresh failed:", error);
      return false;
    }
  }, [items]);

  const addToCart = useCallback((product: Product) => {
    if (
      !product.isActive ||
      product.isArchived ||
      product.stockQuantity <= 0
    ) {
      return;
    }

    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        if (existingItem.quantity >= product.stockQuantity) {
          return currentItems;
        }

        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                ...product,
                quantity: Math.min(
                  item.quantity + 1,
                  product.stockQuantity
                ),
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity < 1) {
        setItems((currentItems) =>
          currentItems.filter((item) => item.id !== productId)
        );
        return;
      }

      setItems((currentItems) =>
        currentItems.map((item) => {
          if (item.id !== productId) {
            return item;
          }

          return {
            ...item,
            quantity: Math.min(
              Math.floor(quantity),
              item.stockQuantity
            ),
          };
        })
      );
    },
    []
  );

  const removeFromCart = useCallback((productId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId)
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      isReady,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshInventory,
    }),
    [
      items,
      itemCount,
      subtotal,
      isReady,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshInventory,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
