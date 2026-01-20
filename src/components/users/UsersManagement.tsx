// src/components/users/UsersManagement.tsx
import React, { useState } from "react";
import UsersMaster from "../../pages/UsersMaster";


export default function UsersManagement() {
    const [activeTab, setActiveTab] = useState("Users");

    return (
        < >
            <UsersMaster />
        </>
    );
}