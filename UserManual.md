# FleetFuel User Manual

Welcome to the **FleetFuel** platform! This manual serves as a comprehensive guide to setting up the software locally and navigating the distinct workflows for both Fleet Companies and Fuel Suppliers.

---

## 1. Prerequisites and Installation

To run FleetFuel locally, ensure your system meets the following prerequisites:
- **Node.js**: Version `20.0.0` or higher.
- **npm**: Node package manager (comes bundled with Node.js).
- **Git**: For cloning the repository.

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd FleetFuel
```

### Step 2: Backend Setup
The backend is a Node.js modular monolith utilizing the `bfast` framework. It uses an in-memory database, so no external database setup is required.
```bash
# Navigate to the backend directory
cd Backend

# Install dependencies
npm install

# Start the backend development server
npm run dev
```
*The backend will typically start on port 3000. You can verify it is running by observing the console output.*

### Step 3: Frontend Setup
The frontend is a React Single Page Application powered by Vite.
Open a **new terminal window/tab**:
```bash
# Navigate to the frontend directory from the project root
cd Frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```
*Vite will provide a localhost URL (e.g., `http://localhost:5173`). Open this URL in your web browser.*

### Running Automated Tests
- **Backend**: Inside the `Backend` directory, run `npm test` to execute the native Node test suite.
- **Frontend**: Inside the `Frontend` directory, run `npm test` or `npm run test:watch` to execute Vitest suites.

---

## 2. User Roles Overview

The platform uses a strict role-based access control system. When registering, you must choose one of two paths:
1. **Fleet Company (`fleet_company`)**: Logistics companies that need to monitor their vehicles' fuel efficiency and purchase fuel logically.
2. **Fuel Supplier (`fuel_supplier`)**: Fuel vendors who publish fuel offers and fulfill purchase requests from Fleet Companies.

*Note: Due to our single-tenant architecture, your registered user account acts as the master account for your respective company profile.*

---

## 3. Walkthrough: Fleet Company Workflow

This workflow guides you through setting up your fleet, monitoring vehicles, and purchasing fuel.

### 3.1 Registration & Login
1. Navigate to the frontend URL.
2. Click **Sign Up**.
3. Select **"Fleet Company"** as your role. Enter an email and password.
4. Upon successful registration, you will be redirected to the Fleet Company Dashboard.

### 3.2 Setting Up Your Fleet
1. Navigate to the **Fleet** tab on the sidebar.
2. **Create a Fleet**: Provide a name for your fleet division (e.g., "Northern Logistics").
3. **Register Vehicles**: Add vehicles to your fleet by entering their Make, Model, License Plate, and assigning them to the fleet you just created.
4. *Behind the scenes, logical fuel sensors are automatically mapped to these vehicles.*

### 3.3 Procuring Fuel (Marketplace)
1. Navigate to the **Procurement** or **Marketplace** tab on the sidebar.
2. Here, you will see a list of available Fuel Suppliers and their active Fuel Offers (Price per liter, Fuel Type).
3. Select a supplier and click **Request Fuel**.
4. Specify the volume of fuel (liters) you wish to procure and submit the request.
5. The request enters a `PENDING` state until the Fuel Supplier approves it.

### 3.4 Monitoring Transactions & Telemetry
1. **Fuel Ledger**: Navigate to your **Operations** or **Dashboard** view. Once a Fuel Supplier approves your request, the requested volume of fuel will automatically be `DEPOSIT`ed into your logical Fuel Account.
2. **Live Telemetry**: As vehicles "drive" (simulated via the backend), you will see their fuel levels decrease in real-time. This corresponds to `WITHDRAWAL` events on your Fuel Ledger.
3. If abnormal fuel drops occur, the dashboard will trigger a **Theft Alert**.

---

## 4. Walkthrough: Fuel Supplier Workflow

This workflow guides you through managing your fuel offerings and fulfilling buyer requests.

### 4.1 Registration & Login
1. Navigate to the frontend URL.
2. Click **Sign Up**.
3. Select **"Fuel Supplier"** as your role. Enter an email and password.
4. Upon successful registration, you will be redirected to the Supplier Dashboard.

### 4.2 Managing Fuel Offers
1. Navigate to the **Offers** or **My Profile** section.
2. Create new Fuel Offers by specifying:
   - **Fuel Type** (e.g., Diesel, Unleaded).
   - **Quantity Available** (Liters).
   - **Price per Liter**.
3. These offers are immediately visible to all registered Fleet Companies in their marketplace.

### 4.3 Fulfilling Orders
1. Navigate to the **Procurement Requests** tab.
2. Here, you will see incoming requests from Fleet Companies requesting a specific volume of fuel.
3. Review the request details.
4. Click **APPROVE** to fulfill the order, or **REJECT** if you cannot fulfill it.
5. *Upon approval, the system automatically handles transferring the logical fuel volume to the Fleet Company's ledger.*

---

## 5. Developer Guide: Simulating Telemetry

Because FleetFuel does not integrate with physical IoT edge sensors for the MVP, vehicle telemetry must be simulated. Developers and evaluators can use tools like `curl` or Postman to inject dummy readings.

### Identifying the Vehicle
First, you need the `vehicleId` of the vehicle you wish to simulate. This can usually be found in the URL or network requests on the Fleet management page.

### Sending a Simulated Fuel Reading
Send a POST request to the Telemetry module to simulate a fuel reading.

```bash
# Example cURL command to simulate a fuel sensor reading
curl -X POST http://localhost:3000/api/telemetry/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "vehicle-12345",
    "fuelLevelLiters": 45.5,
    "timestamp": "2023-10-27T10:00:00Z"
  }'
```

- **Normal Usage**: Send gradually decreasing `fuelLevelLiters` over time to simulate driving.
- **Theft Alert**: Send a drastically lower `fuelLevelLiters` value in a short timeframe to trigger a theft alert on the frontend dashboard.
- **Refueling**: Send a significantly higher `fuelLevelLiters` value. This will trigger a `WITHDRAWAL` from the Fleet Company's overarching Fuel Account ledger.

---
*End of Manual*
