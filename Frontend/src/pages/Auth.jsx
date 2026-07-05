import { useState } from "react";
import { Fuel, LogIn, UserPlus } from "lucide-react";
import { FleetFuelApi } from "@/lib/client";

const roles = [
  { value: "fleet_company", label: "Fleet company" },
  { value: "fuel_supplier", label: "Fuel supplier" },
];

const emptyRegistration = {
  email: "",
  password: "",
  role: "fleet_company",
  affiliatedServiceId: "",
};

export default function Auth({ onAuthenticated }) {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registrationForm, setRegistrationForm] = useState(emptyRegistration);
  const [loginError, setLoginError] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const session = await FleetFuelApi.auth.login(loginForm);
      onAuthenticated(session);
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setIsCreatingUser(true);
    setRegistrationError("");
    setRegistrationSuccess("");

    try {
      await FleetFuelApi.auth.createUser(registrationForm);
      setRegistrationSuccess("User created. They can now sign in.");
      setRegistrationForm(emptyRegistration);
    } catch (error) {
      setRegistrationError(error.message);
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground grid lg:grid-cols-[minmax(360px,0.75fr)_1fr]">
      <section className="border-r border-border bg-sidebar text-sidebar-foreground px-6 py-8 lg:px-10 flex flex-col">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-gradient-primary grid place-items-center shadow-elevated">
            <Fuel className="size-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-lg font-semibold">FleetFuel</div>
            <div className="text-xs uppercase tracking-widest text-sidebar-foreground/60">Procurement OS</div>
          </div>
        </div>

        <div className="mt-auto max-w-md py-12">
          <h1 className="font-display text-4xl font-semibold leading-tight">FleetFuel</h1>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-8 lg:px-12 flex items-center">
        <div className="w-full max-w-5xl grid gap-6 xl:grid-cols-2">
          <form onSubmit={handleLogin} className="rounded-lg border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3">
              <LogIn className="size-5 text-primary" />
              <h2 className="font-display text-2xl font-semibold">Sign in</h2>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block text-sm font-medium">
                Email
                <input
                  className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-ring"
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                  required
                />
              </label>

              <label className="block text-sm font-medium">
                Password
                <input
                  className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-ring"
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                  required
                />
              </label>
            </div>

            {loginError && <div className="mt-4 text-sm text-destructive">{loginError}</div>}

            <button
              type="submit"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
              disabled={isLoggingIn}
            >
              <LogIn className="size-4" />
              {isLoggingIn ? "Signing in" : "Sign in"}
            </button>
          </form>

          <form onSubmit={handleCreateUser} className="rounded-lg border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-3">
              <UserPlus className="size-5 text-primary" />
              <h2 className="font-display text-2xl font-semibold">Create user</h2>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium sm:col-span-2">
                User email
                <input
                  className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-ring"
                  type="email"
                  value={registrationForm.email}
                  onChange={(event) => setRegistrationForm({ ...registrationForm, email: event.target.value })}
                  required
                />
              </label>

              <label className="block text-sm font-medium">
                User password
                <input
                  className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-ring"
                  type="password"
                  value={registrationForm.password}
                  onChange={(event) => setRegistrationForm({ ...registrationForm, password: event.target.value })}
                  required
                />
              </label>

              <label className="block text-sm font-medium">
                Role
                <select
                  className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-ring"
                  value={registrationForm.role}
                  onChange={(event) => setRegistrationForm({ ...registrationForm, role: event.target.value })}
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium sm:col-span-2">
                Affiliated service ID
                <input
                  className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-ring"
                  value={registrationForm.affiliatedServiceId}
                  onChange={(event) => setRegistrationForm({ ...registrationForm, affiliatedServiceId: event.target.value })}
                  required
                />
              </label>
            </div>

            {registrationError && <div className="mt-4 text-sm text-destructive">{registrationError}</div>}
            {registrationSuccess && <div className="mt-4 text-sm text-success">{registrationSuccess}</div>}

            <button
              type="submit"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-semibold transition hover:bg-muted disabled:opacity-60"
              disabled={isCreatingUser}
            >
              <UserPlus className="size-4" />
              {isCreatingUser ? "Creating user" : "Create user"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
