import type { Meta, StoryObj } from "@storybook/react-vite";
import { createKcPageStory } from "../KcPageStory";

const { KcPageStory } = createKcPageStory({ pageId: "login-passkeys-conditional-authenticate.ftl" });

const meta = {
  title: "login/login-passkeys-conditional-authenticate.ftl",
  component: KcPageStory
} satisfies Meta<typeof KcPageStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <KcPageStory
      kcContext={{
        url: {
          loginAction: "/mock-login-action",
          registrationUrl: "/mock-registration",
          resourcesPath: "/resources"
        },
        realm: {
          registrationAllowed: true,
          password: true
        },
        isUserIdentified: false,
        challenge: "mock-challenge",
        userVerification: "required",
        rpId: "localhost",
        createTimeout: 60000,
        authenticators: {
          authenticators: [
            {
              credentialId: "cred-1",
              label: "My Passkey",
              transports: {
                iconClass: "kcAuthenticatorUsbIcon",
                displayNameProperties: ["USB"]
              },
              createdAt: "2023-01-01"
            }
          ]
        },
        shouldDisplayAuthenticators: true,
        usernameHidden: false,
        login: {
          username: "user@example.com"
        },
        messagesPerField: {
          existsError: () => false,
          get: () => ""
        }
      }}
    />
  )
};

