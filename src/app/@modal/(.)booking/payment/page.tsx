"use client";

import Modal from "@/components/Modal";
import PaymentPage from "@/app/booking/payment/page";

export default function PaymentModal() {
    return (
        <Modal>
            <PaymentPage isModal={true} />
        </Modal>
    );
}
