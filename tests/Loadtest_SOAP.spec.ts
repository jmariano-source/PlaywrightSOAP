import { test } from "@playwright/test";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

// 1. Load and parse CSV data at the top level
// This allows Playwright to dynamically create one test per row
const csvdata = parse(fs.readFileSync(path.join(__dirname, "testdata/test-data.csv")), {
    columns: true,
    skip_empty_lines: true,
    skip_records_with_empty_values: true
});

// 2. Wrap the test in a for-of loop
for (const record of csvdata) {
    // Unique name for each test (using CompanyName from the row)
    test(`Merchant Registration: ${record.CompanyName}`, async ({ page }) => {
        
        // --- Step 1: Login ---
        await page.goto('http://172.100.30.144:47443/ops-portal/#/session');
        await page.getByRole('textbox', { name: 'Username' }).fill('admin');
        await page.getByRole('textbox', { name: 'Password' }).fill('admin');
        await page.getByRole('button', { name: 'Login' }).click();

        // --- Step 2: Navigation ---
        await page.getByRole('link', { name: 'Companies' }).click();
        await page.getByRole('link', { name: 'Merchant' }).click();
        await page.getByText('Register New', { exact: true }).click();

        // --- Step 3: Form Entry (using 'record' instead of 'csvdata[0]') ---
        await page.getByRole('textbox', { name: 'Company Name' }).fill(record.CompanyName);

        // Merchant Category
        await page.locator('#referenceNumber').selectOption(record.MerchantCategory);
        
        // Merchant Type
        await page.locator('#merchantType').selectOption(record.MerchantType);

        // Internal Category
        await page.locator('#category').selectOption(record.InternalCategory);

        await page.getByRole('textbox', { name: 'Business Name' }).fill(record.BusinessName);
        await page.getByRole('textbox', { name: 'Trade Name' }).fill(record.TradeName);
        
        // Wallet Tag
        await page.locator('#clientTag').selectOption(record.WalletTag);

        await page.getByRole('textbox', { name: 'Contact Number' }).fill(record.ContactNumber);
        await page.getByRole('textbox', { name: 'SMS Recipient' }).fill(record.SMSRecipient);

        // Address Fields
        await page.getByRole('textbox', { name: 'Business address' }).fill(record.BusinessAddress);
        await page.locator('#baCity').fill(record.BCity);
        await page.locator('#baProvince').fill(record.BProvince);
        await page.locator('#baZipCode').fill(record.BZipcode);

        await page.getByRole('textbox', { name: 'Delivery address' }).fill(record.DeliveryAddress);
        await page.locator('#daCity').fill(record.DCity);
        await page.locator('#daProvince').fill(record.DProvince);
        await page.locator('#daZipCode').fill(record.DZipcode);

        // Beneficiary Info
        await page.getByRole('textbox', { name: 'First name' }).fill(record.BFname);
        await page.getByRole('textbox', { name: 'Middle name' }).fill(record.BMname);
        await page.getByRole('textbox', { name: 'Last name' }).fill(record.BLname);

        // Date Formatting Logic
        const [month, day, year] = record.BDay.split('-');
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        await page.getByRole('textbox', { name: 'Birth date' }).fill(formattedDate);

        await page.getByRole('textbox', { name: 'Birth place' }).fill(record.BPlace);
        await page.getByRole('textbox', { name: 'Nationality' }).fill(record.Nationality);
        await page.getByRole('textbox', { name: 'Email' }).fill(record.Email);

        // Select Options
        await page.locator('#gender').selectOption(record.Gender);
        await page.locator('#maritalStatus').selectOption(record.CivilStatus);

        // Final Address Fields
        await page.getByRole('textbox', { name: 'Present address' }).fill(record.PresentAddress);
        await page.locator('#city1').fill(record.PreCity);
        await page.locator('#province1').fill(record.PreProvince);
        await page.locator('#zipcode1').fill(record.PreZipcode);

        await page.getByRole('textbox', { name: 'Permanent address' }).fill(record.PermanentAddress);
        await page.locator('#city2').fill(record.PermaCity);
        await page.locator('#province2').fill(record.PermaProvince);
        await page.locator('#zipcode2').fill(record.PermaZipcode);

        //await page.pause();
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByText('Refresh All').click();
        //await page.pause();

        //await page.waitForTimeout(3000);

        // --- Finalize ---
        // await page.locator('#save').click(); 
        // console.log(`Finished registration for: ${record.CompanyName}`);
    });
}