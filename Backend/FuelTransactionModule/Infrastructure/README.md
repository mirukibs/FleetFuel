## The Infrastructure Layer

The **Infrastructure layer** handles the low-level details of data persistence for the Fuel Transaction module.

**Data Storage**
- `inMemoryDatabase.mjs`: Currently utilizes an in-memory data store structure to simulate database behavior, providing rapid prototyping and development without the overhead of spinning up a full database server.

**Repositories Implementations**
- Implements the `FuelAccountRepository` interface to perform in-memory persistence and retrieval of account balances and transaction histories.

![alt text](Infrastructure.png)