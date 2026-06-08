export type ShippingStatus =
    | 'order_confirmed'
    | 'payment_verified'
    | 'preparing'
    | 'handed_to_carrier'
    | 'in_transit'
    | 'out_for_delivery'
    | 'delivered';

export type ShippingStageDefinition = {
    status: ShippingStatus;
    title: string;
    body: string;
    timelineLabel: string;
};

export const SHIPPING_STAGES: ShippingStageDefinition[] = [
    {
        status: 'order_confirmed',
        title: 'Order confirmed',
        body: 'Your order was registered successfully. We are validating the details.',
        timelineLabel: 'Order confirmed',
    },
    {
        status: 'payment_verified',
        title: 'Payment verified',
        body: 'Your payment was approved. The seller will start preparing your order.',
        timelineLabel: 'Payment verified',
    },
    {
        status: 'preparing',
        title: 'Preparing shipment',
        body: 'The seller is packing your products for dispatch.',
        timelineLabel: 'Preparing shipment',
    },
    {
        status: 'handed_to_carrier',
        title: 'Handed to carrier',
        body: 'Your package was handed to the logistics partner.',
        timelineLabel: 'Handed to carrier',
    },
    {
        status: 'in_transit',
        title: 'In transit',
        body: 'Your order is on the way to the delivery address.',
        timelineLabel: 'In transit',
    },
    {
        status: 'out_for_delivery',
        title: 'Out for delivery',
        body: 'The carrier is close to your address. Get ready to receive it.',
        timelineLabel: 'Out for delivery',
    },
    {
        status: 'delivered',
        title: 'Delivered',
        body: 'Your order was delivered successfully. Thank you for shopping on VincoBov.',
        timelineLabel: 'Delivered',
    },
];

export function getShippingStageIndex(status: ShippingStatus | null | undefined) {
    if (!status) {
        return -1;
    }
    return SHIPPING_STAGES.findIndex((stage) => stage.status === status);
}
