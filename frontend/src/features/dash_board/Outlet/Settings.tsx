import { useState } from "react";
import {
  Users,
  ShieldCheck,
  Bell,
  Lock,
  Settings as SettingsIcon,
  Save,
  AlertTriangle,
  ChevronDown,
  KeyRound,
  Smartphone,
  Monitor,
  Eye,
  Upload,
  Wrench,
} from "lucide-react";

type Section =
  | "users"
  | "moderation"
  | "notifications"
  | "security"
  | "platform";

export default function Settings() {
  const [activeSection, setActiveSection] = useState<Section>("users");

  const [settings, setSettings] = useState({
    // User settings
    allowRegistrations: true,
    requireEmailVerification: true,
    requireWorkerVerification: true,
    requireIdVerification: true,
    requireCertificate: true,
    requireExperienceProof: true,
    minimumPasswordLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSpecialCharacter: true,
    autoSuspendAfterReports: 5,

    // Moderation
    allowTextPosts: true,
    allowImages: true,
    allowVideos: true,
    allowLinks: true,
    allowJobPosts: true,
    autoModeration: false,
    autoHideReportedPosts: false,
    reportsBeforeReview: 3,

    // Notifications
    emailNotifications: true,
    reportNotifications: true,
    verificationNotifications: true,
    securityNotifications: true,
    notifyAdminsForReports: true,
    notifyAdminsForVerification: true,

    // Security
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,

    // Platform
    platformName: "SkillConnect",
    contactEmail: "support@skillconnect.com",
    maintenanceMode: false,
  });

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = () => {
    console.log("Settings saved:", settings);

    // Later connect this to FastAPI:
    // PUT /admin/settings
  };

  const menuItems = [
    {
      id: "users" as Section,
      label: "User Settings",
      description: "Accounts, registration and verification",
      icon: Users,
    },
    {
      id: "moderation" as Section,
      label: "Moderation",
      description: "Content and reporting rules",
      icon: ShieldCheck,
    },
    {
      id: "notifications" as Section,
      label: "Notifications",
      description: "Alerts and email notifications",
      icon: Bell,
    },
    {
      id: "security" as Section,
      label: "Security",
      description: "Admin access and login security",
      icon: Lock,
    },
    {
      id: "platform" as Section,
      label: "Platform Settings",
      description: "Branding and platform configuration",
      icon: SettingsIcon,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <SettingsIcon size={16} />
            <span>Administration</span>
            <span>/</span>
            <span>Settings</span>
          </div>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Platform Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Configure and manage your platform without changing the application
            code.
          </p>
        </div>

        <button
          onClick={saveSettings}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Save size={17} />
          Save Changes
        </button>
      </div>

      {/* Maintenance warning */}
      {settings.maintenanceMode && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 text-amber-600" size={20} />

          <div>
            <p className="font-medium text-amber-900">
              Maintenance mode is enabled
            </p>

            <p className="mt-1 text-sm text-amber-700">
              Normal users may not be able to access the platform while
              maintenance mode is active.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[270px_1fr]">
        {/* Settings navigation */}
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`mb-1 flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`mt-0.5 rounded-lg p-2 ${
                    active
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium">{item.label}</p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Settings content */}
        <section className="min-w-0">
          {activeSection === "users" && (
            <UserSettings
              settings={settings}
              updateSetting={updateSetting}
            />
          )}

          {activeSection === "moderation" && (
            <ModerationSettings
              settings={settings}
              updateSetting={updateSetting}
            />
          )}

          {activeSection === "notifications" && (
            <NotificationSettings
              settings={settings}
              updateSetting={updateSetting}
            />
          )}

          {activeSection === "security" && (
            <SecuritySettings
              settings={settings}
              updateSetting={updateSetting}
            />
          )}

          {activeSection === "platform" && (
            <PlatformSettings
              settings={settings}
              updateSetting={updateSetting}
            />
          )}
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   USER SETTINGS
========================================================= */

function UserSettings({ settings, updateSetting }: any) {
  return (
    <div className="space-y-5">
      <SettingsCard
        title="Registration"
        description="Control how new users create accounts."
      >
        <Toggle
          label="Allow new registrations"
          description="Allow visitors to create new accounts."
          checked={settings.allowRegistrations}
          onChange={(value) =>
            updateSetting("allowRegistrations", value)
          }
        />

        <Toggle
          label="Require email verification"
          description="Users must verify their email before using the platform."
          checked={settings.requireEmailVerification}
          onChange={(value) =>
            updateSetting("requireEmailVerification", value)
          }
        />
      </SettingsCard>

      <SettingsCard
        title="Worker verification"
        description="Define the information required before a worker can receive a verified badge."
      >
        <Toggle
          label="Require worker verification"
          description="Workers must complete verification before becoming verified."
          checked={settings.requireWorkerVerification}
          onChange={(value) =>
            updateSetting("requireWorkerVerification", value)
          }
        />

        <Toggle
          label="Require ID verification"
          description="Workers must submit a valid identification document."
          checked={settings.requireIdVerification}
          onChange={(value) =>
            updateSetting("requireIdVerification", value)
          }
        />

        <Toggle
          label="Require certificate"
          description="Require professional or training certificates."
          checked={settings.requireCertificate}
          onChange={(value) =>
            updateSetting("requireCertificate", value)
          }
        />

        <Toggle
          label="Require proof of experience"
          description="Workers must provide evidence of professional experience."
          checked={settings.requireExperienceProof}
          onChange={(value) =>
            updateSetting("requireExperienceProof", value)
          }
        />
      </SettingsCard>

      <SettingsCard
        title="Password rules"
        description="Configure the minimum requirements for user passwords."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <NumberInput
            label="Minimum password length"
            value={settings.minimumPasswordLength}
            onChange={(value) =>
              updateSetting("minimumPasswordLength", value)
            }
          />

          <div />
        </div>

        <Toggle
          label="Require uppercase letter"
          description="Passwords must contain at least one uppercase letter."
          checked={settings.requireUppercase}
          onChange={(value) =>
            updateSetting("requireUppercase", value)
          }
        />

        <Toggle
          label="Require number"
          description="Passwords must contain at least one number."
          checked={settings.requireNumber}
          onChange={(value) =>
            updateSetting("requireNumber", value)
          }
        />

        <Toggle
          label="Require special character"
          description="Passwords must contain a special character."
          checked={settings.requireSpecialCharacter}
          onChange={(value) =>
            updateSetting("requireSpecialCharacter", value)
          }
        />
      </SettingsCard>

      <SettingsCard
        title="Account suspension"
        description="Configure automatic account suspension rules."
      >
        <NumberInput
          label="Reports before automatic suspension review"
          value={settings.autoSuspendAfterReports}
          onChange={(value) =>
            updateSetting("autoSuspendAfterReports", value)
          }
        />

        <p className="text-xs text-slate-400">
          This should trigger a review rather than immediately banning the
          account.
        </p>
      </SettingsCard>
    </div>
  );
}

/* =========================================================
   MODERATION SETTINGS
========================================================= */

function ModerationSettings({ settings, updateSetting }: any) {
  return (
    <div className="space-y-5">
      <SettingsCard
        title="Allowed content"
        description="Choose what users are allowed to publish."
      >
        <Toggle
          label="Text posts"
          description="Allow users to create text-based posts."
          checked={settings.allowTextPosts}
          onChange={(value) => updateSetting("allowTextPosts", value)}
        />

        <Toggle
          label="Images"
          description="Allow images in posts."
          checked={settings.allowImages}
          onChange={(value) => updateSetting("allowImages", value)}
        />

        <Toggle
          label="Videos"
          description="Allow videos in posts."
          checked={settings.allowVideos}
          onChange={(value) => updateSetting("allowVideos", value)}
        />

        <Toggle
          label="External links"
          description="Allow users to share links."
          checked={settings.allowLinks}
          onChange={(value) => updateSetting("allowLinks", value)}
        />

        <Toggle
          label="Job posts"
          description="Allow approved users to publish job opportunities."
          checked={settings.allowJobPosts}
          onChange={(value) => updateSetting("allowJobPosts", value)}
        />
      </SettingsCard>

      <SettingsCard
        title="Reports"
        description="Configure how reported content should be handled."
      >
        <Toggle
          label="Automatically hide heavily reported posts"
          description="Hide content after it reaches the configured report threshold."
          checked={settings.autoHideReportedPosts}
          onChange={(value) =>
            updateSetting("autoHideReportedPosts", value)
          }
        />

        <NumberInput
          label="Reports required before review"
          value={settings.reportsBeforeReview}
          onChange={(value) =>
            updateSetting("reportsBeforeReview", value)
          }
        />
      </SettingsCard>

      <SettingsCard
        title="Automatic moderation"
        description="Automatically detect potentially problematic content."
      >
        <Toggle
          label="Enable automatic moderation"
          description="Use automated checks to identify spam, scams and inappropriate content."
          checked={settings.autoModeration}
          onChange={(value) => updateSetting("autoModeration", value)}
        />

        {settings.autoModeration && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">
              Automatic moderation is enabled
            </p>

            <p className="mt-1 text-xs text-blue-700">
              Automated moderation should flag content for review. It should
              not permanently ban users without administrator review.
            </p>
          </div>
        )}
      </SettingsCard>

      <SettingsCard
        title="Report categories"
        description="Categories available when users submit reports."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            "Spam",
            "Fraud / Scam",
            "Harassment",
            "Fake Profile",
            "Inappropriate Content",
            "Abusive Language",
            "Suspicious Worker",
            "Other",
          ].map((category) => (
            <label
              key={category}
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
            >
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />

              <span className="text-sm text-slate-700">
                {category}
              </span>
            </label>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}

/* =========================================================
   NOTIFICATION SETTINGS
========================================================= */

function NotificationSettings({ settings, updateSetting }: any) {
  return (
    <div className="space-y-5">
      <SettingsCard
        title="Email notifications"
        description="Control platform email notifications."
      >
        <Toggle
          label="Enable email notifications"
          description="Allow the platform to send administrative email notifications."
          checked={settings.emailNotifications}
          onChange={(value) =>
            updateSetting("emailNotifications", value)
          }
        />

        <Toggle
          label="Report notifications"
          description="Notify administrators when users submit reports."
          checked={settings.reportNotifications}
          onChange={(value) =>
            updateSetting("reportNotifications", value)
          }
        />

        <Toggle
          label="Verification notifications"
          description="Notify administrators when workers submit verification requests."
          checked={settings.verificationNotifications}
          onChange={(value) =>
            updateSetting("verificationNotifications", value)
          }
        />

        <Toggle
          label="Security notifications"
          description="Notify administrators about important security events."
          checked={settings.securityNotifications}
          onChange={(value) =>
            updateSetting("securityNotifications", value)
          }
        />
      </SettingsCard>

      <SettingsCard
        title="Admin alerts"
        description="Choose which events should appear in the administrator dashboard."
      >
        <Toggle
          label="New reports"
          description="Show alerts when a new report is submitted."
          checked={settings.notifyAdminsForReports}
          onChange={(value) =>
            updateSetting("notifyAdminsForReports", value)
          }
        />

        <Toggle
          label="New verification requests"
          description="Show alerts when a worker requests verification."
          checked={settings.notifyAdminsForVerification}
          onChange={(value) =>
            updateSetting("notifyAdminsForVerification", value)
          }
        />
      </SettingsCard>
    </div>
  );
}

/* =========================================================
   SECURITY SETTINGS
========================================================= */

function SecuritySettings({ settings, updateSetting }: any) {
  return (
    <div className="space-y-5">
      <SettingsCard
        title="Administrator account"
        description="Manage your administrator authentication."
      >
        <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <KeyRound size={18} />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-900">
                Change admin password
              </p>

              <p className="text-xs text-slate-500">
                Update the password used to access the admin dashboard.
              </p>
            </div>
          </div>

          <ChevronDown size={18} className="-rotate-90 text-slate-400" />
        </button>
      </SettingsCard>

      <SettingsCard
        title="Two-factor authentication"
        description="Add another layer of protection to the administrator account."
      >
        <Toggle
          label="Enable two-factor authentication"
          description="Require a second verification step when administrators log in."
          checked={settings.twoFactorEnabled}
          onChange={(value) =>
            updateSetting("twoFactorEnabled", value)
          }
        />

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
          <Smartphone size={20} className="text-slate-500" />

          <div>
            <p className="text-sm font-medium text-slate-900">
              Authentication app
            </p>

            <p className="text-xs text-slate-500">
              Use an authenticator application for verification codes.
            </p>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Login security"
        description="Control administrator login protection."
      >
        <NumberInput
          label="Session timeout (minutes)"
          value={settings.sessionTimeout}
          onChange={(value) =>
            updateSetting("sessionTimeout", value)
          }
        />

        <NumberInput
          label="Maximum failed login attempts"
          value={settings.maxLoginAttempts}
          onChange={(value) =>
            updateSetting("maxLoginAttempts", value)
          }
        />

        <Toggle
          label="Suspicious login alerts"
          description="Notify administrators when unusual login activity is detected."
          checked={settings.loginAlerts}
          onChange={(value) => updateSetting("loginAlerts", value)}
        />
      </SettingsCard>

      <SettingsCard
        title="Admin sessions"
        description="Review devices currently signed in to the admin account."
      >
        <div className="space-y-3">
          <SessionItem
            icon={<Monitor size={18} />}
            device="Windows · Chrome"
            location="Current session"
            active
          />

          <SessionItem
            icon={<Monitor size={18} />}
            device="Windows · Edge"
            location="Last active 2 hours ago"
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Suspicious login attempts"
        description="Review unsuccessful or unusual administrator login attempts."
      >
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">
                No suspicious activity
              </p>

              <p className="mt-1 text-xs text-slate-500">
                No suspicious administrator login attempts detected recently.
              </p>
            </div>

            <Eye size={18} className="text-slate-400" />
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

/* =========================================================
   PLATFORM SETTINGS
========================================================= */

function PlatformSettings({ settings, updateSetting }: any) {
  return (
    <div className="space-y-5">
      <SettingsCard
        title="Platform identity"
        description="Configure the public identity of your platform."
      >
        <TextInput
          label="Platform / Company name"
          value={settings.platformName}
          onChange={(value) =>
            updateSetting("platformName", value)
          }
        />

        <TextInput
          label="Contact email"
          value={settings.contactEmail}
          onChange={(value) =>
            updateSetting("contactEmail", value)
          }
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Platform logo
          </label>

          <button className="flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-300 p-5 text-left hover:bg-slate-50">
            <div className="rounded-lg bg-slate-100 p-3">
              <Upload size={20} className="text-slate-500" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-900">
                Upload platform logo
              </p>

              <p className="mt-1 text-xs text-slate-500">
                PNG, JPG or SVG. Recommended square logo.
              </p>
            </div>
          </button>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Legal pages"
        description="Manage the legal information displayed to users."
      >
        <TextArea
          label="Terms and Conditions"
          placeholder="Enter your Terms and Conditions..."
        />

        <TextArea
          label="Privacy Policy"
          placeholder="Enter your Privacy Policy..."
        />
      </SettingsCard>

      <SettingsCard
        title="Maintenance"
        description="Temporarily restrict access while performing platform maintenance."
      >
        <Toggle
          label="Maintenance mode"
          description="Temporarily place the platform into maintenance mode."
          checked={settings.maintenanceMode}
          onChange={(value) =>
            updateSetting("maintenanceMode", value)
          }
        />

        {settings.maintenanceMode && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <Wrench size={19} className="text-amber-600" />

            <div>
              <p className="text-sm font-medium text-amber-900">
                Platform maintenance is active
              </p>

              <p className="mt-1 text-xs text-amber-700">
                Consider allowing administrators to continue accessing the
                dashboard during maintenance.
              </p>
            </div>
          </div>
        )}
      </SettingsCard>
    </div>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <h2 className="text-base font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div className="divide-y divide-slate-100 px-5 sm:px-6">
        {children}
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-5">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>

        <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-slate-300"
        }`}
        aria-label={label}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="py-4">
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="py-4">
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function TextArea({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div className="py-4">
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <textarea
        rows={7}
        placeholder={placeholder}
        className="w-full resize-y rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function SessionItem({
  icon,
  device,
  location,
  active,
}: {
  icon: React.ReactNode;
  device: string;
  location: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
          {icon}
        </div>

        <div>
          <p className="text-sm font-medium text-slate-900">
            {device}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {location}
          </p>
        </div>
      </div>

      {active ? (
        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
          Active
        </span>
      ) : (
        <button className="text-xs font-medium text-red-600 hover:text-red-700">
          Sign out
        </button>
      )}
    </div>
  );
}