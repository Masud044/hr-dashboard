import { Link } from "react-router-dom";
import img from "../assets/image2.png"

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/70 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src={img} alt="img" width={170} height={170} />
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <button className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition">
                Sign In
              </button>
            </Link>
            <Link to="/register">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Modern HR Management
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Streamline your HR processes with our comprehensive HRMS platform. 
            Manage employees, track performance, and boost team productivity all in one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register">
              <button className="h-12 px-8 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">
                Start Free Trial
              </button>
            </Link>
            <Link to="/login">
              <button className="h-12 px-8 border border-border rounded-lg font-medium hover:bg-accent transition">
                Sign In
              </button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Feature 1 */}
          <div className="bg-card shadow-lg rounded-2xl p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-primary rounded"></div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Employee Management</h3>
            <p className="text-muted-foreground">
              Comprehensive employee profiles, document management, and organizational structure tracking.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-card shadow-lg rounded-2xl p-6">
            <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-chart-2 rounded"></div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Performance Analytics</h3>
            <p className="text-muted-foreground">
              Real-time dashboards and insights to track team performance and individual growth metrics.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-card shadow-lg rounded-2xl p-6">
            <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center mb-4">
              <div className="w-6 h-6 bg-chart-3 rounded"></div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
            <p className="text-muted-foreground">
              Enhanced communication tools, recognition systems, and collaborative workspace management.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-card shadow-lg rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to transform your HR processes?
            </h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of companies already using our HRMS platform to manage their workforce efficiently.
            </p>
            <Link to="/register">
              <button className="h-12 px-8 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">
                Create Your Account
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;