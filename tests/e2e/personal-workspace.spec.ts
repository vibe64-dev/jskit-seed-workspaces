import { expect, test } from "@playwright/test";

const BASE_URL = String(process.env.PLAYWRIGHT_BASE_URL || "").replace(/\/+$/u, "");

if (!BASE_URL) {
  throw new Error("PLAYWRIGHT_BASE_URL is required for the personal workspace browser test.");
}

const viewports = [
  { name: "compact", width: 390, height: 844 },
  { name: "medium", width: 768, height: 1024 },
  { name: "expanded", width: 1280, height: 900 }
];

const primaryAccount = {
  username: "personal-workspace-e2e",
  email: "personal-workspace-e2e@example.test",
  password: "AppPersonal!2026"
};

const isolationAccount = {
  username: "personal-workspace-isolation-e2e",
  email: "personal-workspace-isolation-e2e@example.test",
  password: "AppPersonal!2026"
};

function appUrl(pathname: string) {
  return `${BASE_URL}${pathname}`;
}

async function expectNoHorizontalOverflow(page) {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

async function signInOrRegister(page, account) {
  await page.goto(appUrl("/auth/login"));
  await expect(page.getByText("Sign in", { exact: true }).first()).toBeVisible();
  const switchAccountButton = page.getByRole("button", {
    name: "Use another account",
    exact: true
  });
  if (await switchAccountButton.isVisible()) {
    await switchAccountButton.click();
  }
  await page.locator('input[type="email"]').fill(account.email);
  await page.locator('input[type="password"]').fill(account.password);
  await page.getByTestId("auth-submit").click();

  await page.waitForFunction(
    () =>
      window.location.pathname === "/home" ||
      document.body.innerText.includes("Invalid email or password.")
  );

  if (new URL(page.url()).pathname === "/home") {
    return;
  }

  await expect(page.getByText("Invalid email or password.", { exact: true })).toBeVisible();
  await page.getByTestId("auth-mode-register").click();
  await expect(page.getByText("Create your account", { exact: true })).toBeVisible();
  await page.locator('input[type="email"]').fill(account.email);
  await page.locator('input[type="password"]').nth(0).fill(account.password);
  await page.locator('input[type="password"]').nth(1).fill(account.password);
  await page.getByTestId("auth-submit").click();
  await page.waitForURL((url) => url.pathname === "/home");
}

async function signOut(page, username: string) {
  await page.goto(appUrl("/home"));
  await page.getByRole("button", { name: username, exact: true }).click();
  await page.getByRole("link", { name: "Sign out", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/auth/login");
}

async function openPersonalWorkspace(page, username: string) {
  const workspaceButton = page.getByRole("button", { name: "Workspace", exact: true });
  await expect(workspaceButton).toBeVisible();
  const menuId = await workspaceButton.getAttribute("aria-controls");
  expect(menuId).toBeTruthy();

  await workspaceButton.click();
  const workspaceMenu = page.locator(`#${menuId}`);
  await expect(workspaceMenu.getByRole("listitem")).toHaveCount(1);
  const workspaceItem = workspaceMenu.getByRole("listitem").filter({ hasText: username });
  await Promise.all([
    page.waitForURL((url) => url.pathname === `/w/${username}`),
    workspaceItem.click()
  ]);
}

test("database-backed account can use its personal workspace", async ({ page }) => {
  test.setTimeout(120_000);

  await signInOrRegister(page, primaryAccount);

  await page.goto(appUrl("/account"));
  await expect(page.getByText("Invites", { exact: true })).toHaveCount(0);
  await page.goto(appUrl("/home"));

  await openPersonalWorkspace(page, primaryAccount.username);
  await expect(page.getByRole("heading", { name: "Workspace Home", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "No workspace activity yet", exact: true })).toBeVisible();

  for (const viewport of viewports) {
    await test.step(`${viewport.name} workspace remains usable`, async () => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await expect(page.getByRole("heading", { name: "Workspace Home", exact: true })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }

  await page.getByRole("button", { name: primaryAccount.username, exact: true }).click();
  const adminLink = page.getByRole("link", { name: "Go to admin", exact: true });
  await expect(adminLink).toHaveAttribute("href", `/w/${primaryAccount.username}/admin`);
  await adminLink.click();
  await page.waitForURL((url) => url.pathname === `/w/${primaryAccount.username}/admin`);
  await expect(page.getByRole("heading", { name: "Workspace Admin", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Members", exact: true })).toHaveAttribute(
    "href",
    `/w/${primaryAccount.username}/admin/members`
  );
  await expect(page.getByRole("link", { name: "Settings", exact: true })).toHaveAttribute(
    "href",
    `/w/${primaryAccount.username}/admin/workspace/settings`
  );

  await signOut(page, primaryAccount.username);
  await signInOrRegister(page, isolationAccount);
  await openPersonalWorkspace(page, isolationAccount.username);
  await expect(page.getByRole("heading", { name: "No workspace activity yet", exact: true })).toBeVisible();
  await signOut(page, isolationAccount.username);

  await page.locator('input[type="email"]').fill(primaryAccount.email);
  await page.locator('input[type="password"]').fill(primaryAccount.password);
  await page.getByTestId("auth-submit").click();
  await page.waitForURL((url) => url.pathname === "/home");
  await expect(page.getByRole("button", { name: primaryAccount.username, exact: true })).toBeVisible();

  await page.goto(appUrl(`/w/${isolationAccount.username}`));
  await page.waitForURL((url) => url.pathname === "/home");

  await openPersonalWorkspace(page, primaryAccount.username);
  await expect(page.getByRole("heading", { name: "No workspace activity yet", exact: true })).toBeVisible();
});
