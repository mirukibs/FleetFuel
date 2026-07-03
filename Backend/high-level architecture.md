That's a very important observation because it changes the boundary of this module.

Let's step back and look at the entire system rather than the module in isolation.

## Sprint 1 — Vehicle & Fuel Telemetry

The business event being simulated was:

```text
Vehicle drives
        ↓
Fuel level decreases
        ↓
Fuel sensor reports reading
        ↓
System records telemetry
        ↓
Dashboard updates
```

This module answers:

> **What is happening inside the vehicle's tank?**

Its source of truth is the **vehicle sensor**.

---

## Sprint 2 — Fuel Procurement

The business event was:

```text
Fleet purchases fuel
        ↓
Supplier accepts request
        ↓
Fuel allocated
        ↓
Fleet fuel account increases
```

This module answers:

> **How much fuel does the company own?**

Its source of truth is the **fuel account**.

---

## Sprint 3 — Fuel Transaction

This is where the connection happens.

The real-world workflow is:

```text
Fleet fuel account
        ↓
Vehicle arrives at station
        ↓
Fuel dispensed
        ↓
Vehicle tank increases
        ↓
Fleet account decreases
```

Notice something interesting.

This module is no longer just recording history.

It becomes the **bridge** between Procurement and Telemetry.

---

# The simulation changes

Instead of

```text
Record Transaction
```

the simulation is actually

```text
Simulate Refueling
```

That is a much better business use case.

---

## Proposed workflow

Simulation Engine

↓

Choose vehicle

↓

Choose litres

↓

Load Fleet Fuel Account

↓

Verify sufficient balance

↓

Reduce Fuel Account

↓

Increase Vehicle Fuel Level

↓

Record Fuel Transaction

---

Now compare that with Sprint 1.

Driving simulation

```text
Simulation Engine

↓

Vehicle

↓

recordSimulatedReading()

↓

fuel level decreases
```

Refueling simulation

```text
Simulation Engine

↓

FuelAccount

↓

simulateRefueling()

↓

fuel level increases
```

The two simulations become complementary.

---

# Should FuelTransaction still exist?

Yes.

Because the simulation itself is transient.

The transaction is permanent.

Think of it like this:

```text
Simulation

creates

Transaction
```

Exactly the same as Sprint 1.

Sprint 1

```text
Simulation

creates

FuelSensorReading
```

Sprint 3

```text
Simulation

creates

FuelTransaction
```

Very consistent.

---

# The aggregate becomes richer

Instead of

```text
FuelAccount

creditFuel()

recordTransaction()
```

I'd model

```text
FuelAccount

allocateFuel()      <-- Procurement

simulateRefueling() <-- This module

getBalance()
```

Internally

```text
simulateRefueling(vehicleId, litres)

↓

check balance

↓

subtract litres

↓

create FuelTransaction

↓

save
```

Notice how the business language is now much stronger.

---

# Where does the vehicle's fuel level increase?

This is the architectural question.

I would **not** update the vehicle aggregate.

Why?

Because in Sprint 1, the vehicle's fuel level isn't an authoritative state—it's inferred from simulated sensor readings. Introducing direct updates to the vehicle here would create two competing sources of truth.

Keep the responsibilities separated:

* **Fuel Procurement Module** owns the company's available fuel inventory.
* **Fuel Transaction Module** owns refueling events and decrements the company's fuel account.
* **Vehicle & Fuel Telemetry Module** owns the vehicle's reported fuel state through simulated sensor readings.

The integration point is the **simulation engine**. When a refueling is simulated, it can:

1. Call the Fuel Transaction module to record the refueling and deduct the fleet's fuel account.
2. Then trigger the telemetry simulation to emit a new fuel sensor reading reflecting the increased tank level.

That gives you a clean event chain:

```text
Fleet Fuel Account
        │
        ▼
Simulate Refueling
        │
        ▼
Fuel Transaction recorded
        │
        ▼
Fuel Account balance reduced
        │
        ▼
Telemetry Simulation triggered
        │
        ▼
Vehicle Fuel Sensor emits new reading
        │
        ▼
Dashboard updates
```

This has a nice architectural property: **each module remains responsible for its own state**, and the simulation engine coordinates the interaction between them. That's consistent with the layered, modular approach you've been following and avoids introducing unnecessary coupling between the Fuel Transaction and Vehicle & Fuel Telemetry modules.
