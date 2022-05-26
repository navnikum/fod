# Redwood Reference App

## Overview

The Redwood Reference App (RRA) is a simple demonstration application designed to show how
FA developers can create a VB application and implement various capabilities.
It uses **ADFBC-based REST** APIs for the backend, and a couple of other common Applcore features.
It demonstrates how FA developers can configure **audit rules**, **unit tests**, and **integration tests**.
It shows how you can create a **CDN bundle** and use various **Spectra UI components** and **VB/Spectra patterns** for day-to-day development.

## Functionality

The application contains the following pages:

1. Welcome Page - Display a list of orders needing your attention.
2. Manage Orders Page - Displays the list of orders, using smart search.
You can also navigate to the other pages using the list selection or the "..." action menu in each row.
You can also delete an order.
3. Edit Order Page - You can create or edit any order that's in DRAFT status.
You may want to add/update/delete line items,
or upload and/or delete document and update comments.
4. View Order Page - You can view any order details in PROCESSING status.
It displays customer information, shipping address, line items, attachments and comment.
5. View Customer Page - You can view customer information,
including billing and shipping addresses.
It also displays the list of all the orders for the selected customer.
You can also navigate to the above pages using the "..." action menu on each row. You can also delete a specific order.
6. Inventory Page - Displays a list of all the products in the inventory. It uses smart search to refine the list.
You can navigate to the product detail page using the cards.
7. Product Detail Page - Displays product detail information in a foldout layout.
8. Add Product Page - Lets user add a new product in the product inventory. Using the guided process layout.
9. My Training Page - Lists all the trainings the user need to do.
You can navigate to the training detail page by clicking on the cards.
10. Training Detail Page - Shows all the tasks to be completed for the training. Lets the user mark tasks as complete.

## Development
All development is to be done in Visual Builder Studio.

1. Create a workspace using the "Clone From Git" button.
2. Choose fod.git repository.
3. For a new feature, choose master as base branch and create a new branch with this format: "userId_JIRAStory_Description"
4. As "Development Environment", "No environments" needs to be used.
5. Merge requests can be raised with alm. Conditions to merge:
    1. Reviewed by peers.
    2. FABS build clean.

## Running the application locally
In case you need to run the application locally, or if you need to debug build scripts.

1. Clone the repository and change directory. Grab the "clone" link from
the [FOD repository in alm](https://alm.oraclecorp.com/fusionapps/#projects/atk-fusionorderdemo/scm/fod.git/tree?revision=master).
```
git clone [the "clone" link obtained from the link above]
cd fod
```

2. Install npm dependencies
```
npm install
```

3. Build the application
```
npm run build
```

4. Run the app locally
```
npm run start
```

Troubleshooting:
In case of error during the build, make sure you have the proper proxy definition, this is often the main cause of fail downloads of node modules or other files.
Make sure proxy, http_proxy, https_proxy, no_proxy and any other proxy setups for npm are defined correctly in your terminal.

## Generating a bundle
Bundle generation is handled by the build pipeline. In case you need to build locally, you can use this command:

```
npm run bundle:cdn
```

## Audits and Tests
You can rely on FABS to start and run your tests as well as running audits.
They can also be run locally.

1. Run VB Audits
```
npm run vb:audit
```
2. Run Action Chain Tests.
Use Visual Builder Studio to run the action chain tests.

3. Run Integration Tests. By default, it runs against local express server.
Please run the application locally before running integration tests.
```
npm run test:integ:ci
```
4. Start Hoverfly. Starts Hoverfly simulation for FA REST APIs with all default simulation data.
```
npm run hoverfly:start
```
