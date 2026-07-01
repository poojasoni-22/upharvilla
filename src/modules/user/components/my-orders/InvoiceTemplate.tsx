import type React from "react";
import type { OrderItemDisplay } from "./types";

interface InvoiceTemplateProps {
  displayItem: OrderItemDisplay;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  displayItem,
}) => {
  const formattedDate = new Date(displayItem.createdAt).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const orderSubtotal = displayItem.orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const taxOrDiscount = displayItem.totalAmount - orderSubtotal;

  return (
    <div
      id={`invoice-capture-${displayItem.itemId}`}
      style={{
        width: "794px",
        minWidth: "794px",
        maxWidth: "794px",
        boxSizing: "border-box",
      }}
      className="absolute -left-[9999px] top-0 bg-white text-black p-10 font-sans border border-neutral-200"
    >
      {/* Header Block */}
      <div className="flex justify-between items-start gap-4 border-b border-neutral-100 pb-4">
        <div className="space-y-2">
          {/* biome-ignore lint/performance/noImgElement: Client-side logo */}
          <img
            src="/logo.png"
            alt="upharVilla Logo"
            crossOrigin="anonymous"
            style={{ height: "48px", width: "auto", objectFit: "contain" }}
            className="h-12 w-auto object-contain"
          />
          <div>
            <p className="text-xs text-neutral-400 font-medium">
              Thoughtful Gifts & Custom Hamper Creations
            </p>
            <p className="text-[10px] text-neutral-400 font-mono mt-0.5 uppercase">
              upharVilla.in
            </p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">
            Tax Invoice / Bill of Supply
          </h2>
          <p className="text-xs text-neutral-550">
            Order ID:{" "}
            <span className="font-mono text-neutral-800 font-semibold">
              #{displayItem.orderId.slice(-12).toUpperCase()}
            </span>
          </p>
          <p className="text-xs text-neutral-550">
            Date: <span className="text-neutral-855">{formattedDate}</span>
          </p>
        </div>
      </div>

      {/* Addresses / Billing Info Grid */}
      <div className="grid grid-cols-2 gap-8 py-4 border-b border-neutral-100 text-xs">
        {/* Shipping Address */}
        <div className="space-y-2">
          <h3 className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">
            Shipping Destination
          </h3>
          {displayItem.address ? (
            <div className="space-y-1 text-neutral-700">
              <p className="font-bold text-neutral-900 text-sm">
                {displayItem.address.fullName}
              </p>
              <p className="leading-relaxed">{displayItem.address.address}</p>
              <p>
                {displayItem.address.locality &&
                  `${displayItem.address.locality}, `}
                {displayItem.address.city}, {displayItem.address.state} -{" "}
                {displayItem.address.pincode}
              </p>
              <p className="text-neutral-550 font-mono pt-1 text-[11px]">
                Phone: {displayItem.address.phone}
              </p>
            </div>
          ) : (
            <p className="text-neutral-400 italic">
              No delivery address linked.
            </p>
          )}
        </div>

        {/* Payment Details */}
        <div className="space-y-2">
          <h3 className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">
            Payment Details
          </h3>
          <div className="space-y-1.5 text-neutral-700 font-medium">
            <div className="flex items-center gap-2">
              <span className="text-neutral-405 w-28 shrink-0">
                Gateway Status:
              </span>
              <span className="font-bold text-emerald-600 capitalize">
                {displayItem.paymentStatus}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-405 w-28 shrink-0">Method:</span>
              <span className="font-semibold text-neutral-800">
                Razorpay Online Banking
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Items Table */}
      <div className="py-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
              <th className="py-3 pr-4">Product Details</th>
              <th className="py-3 px-4 text-center">Qty</th>
              <th className="py-3 px-4 text-right">Unit Price</th>
              <th className="py-3 pl-4 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {displayItem.orderItems.map((item, index) => (
              <tr
                key={`${item.productId}-${index}`}
                className="border-b border-neutral-100 text-neutral-700"
              >
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border border-neutral-150 overflow-hidden bg-neutral-50 shrink-0 flex items-center justify-center">
                      {/* biome-ignore lint/performance/noImgElement: Client-side invoice product thumb */}
                      <img
                        src={
                          item.thumbnail ||
                          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=150&auto=format&fit=crop&q=60"
                        }
                        alt={item.name}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-neutral-900 text-sm leading-tight">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        SKU: {item.productId.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-center font-semibold text-neutral-805">
                  {item.quantity}
                </td>
                <td className="py-4 px-4 text-right font-medium text-neutral-850">
                  ₹{item.price.toLocaleString("en-IN")}
                </td>
                <td className="py-4 pl-4 text-right font-bold text-neutral-900">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Details */}
      <div className="flex justify-end pt-4 pb-4">
        <div className="w-full sm:w-64 space-y-2 text-xs">
          <div className="flex justify-between text-neutral-500 font-medium">
            <span>Subtotal:</span>
            <span className="font-semibold text-neutral-800">
              ₹{orderSubtotal.toLocaleString("en-IN")}
            </span>
          </div>
          {taxOrDiscount > 0 && (
            <div className="flex justify-between text-neutral-500 font-medium">
              <span>GST & Packaging Fee:</span>
              <span className="font-semibold text-neutral-855">
                ₹{taxOrDiscount.toLocaleString("en-IN")}
              </span>
            </div>
          )}
          {taxOrDiscount < 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount / Promo:</span>
              <span className="font-bold">
                -₹{Math.abs(taxOrDiscount).toLocaleString("en-IN")}
              </span>
            </div>
          )}
          <div className="flex justify-between text-neutral-500 font-medium">
            <span>Shipping Fee:</span>
            <span className="font-bold text-emerald-600">FREE</span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-3 text-sm">
            <span className="font-bold text-neutral-800">Grand Total:</span>
            <span className="font-extrabold text-primary">
              ₹{displayItem.totalAmount.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="border-t border-neutral-100 pt-4 text-center text-[10px] text-neutral-400 space-y-1 font-sans">
        <p className="font-semibold text-neutral-500">
          Thank you for shopping at upharVilla!
        </p>
        <p>
          This is a computer generated document. For support or warranty
          queries, contact us at{" "}
          <span className="font-semibold text-neutral-500">
            support@upharvilla.in
          </span>
          .
        </p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
