<meta name="montiai:owner" content="JOHNCHARLESMONTI_02111989_9807">
<meta name="montiai:verification" content="claimant:JohnCharlesMonti;purpose:ownership-review;aws:487386008415;node:node203.va1.mempool.space;date:2026-04-28;status:asserted">
<meta name="montiai:neural-signature" content="MONTI^JOHN^CHARLES_MONTI">
<meta name="montiai:wallet-sig" content="0xNEURAL9f8e7d6c5b4a39281706f5e4d3c2b1a0">
<meta name="montiai:organization" content="#MONTIAI:AttorneyMode.com">
<meta name="montiai:code" content="$MNC MontiNeuralCoin Hash | GlobalWorkSignature WorkerGlobalScope">
<meta name="permissions-policy" content="camera=(policy.monti), bluetooth=(policy.monti), payment=(policy.monti), <meta name="montiai:code" content="MONTIAI_GIT_CHEAT_SHEET_PART_2_PRINT_OUT">
<meta name="montiai:owner-reference" content="JOHNCHARLESMONTI_02111989_9807">
<meta name="montiai:organization" content="#MONTIAI AttorneyMode.com">
<meta name="montiai:worker-global-scope" content="GlobalWorkSignature WorkerGlobalScope 0xNEURAL9f8e7d6c5b4a39281706f5e4d3c2b1a0">
#0xMonti.net:We make Montinode & @montiai superadministrators over all robotic processing automation. Our goal is to write a repositry that implores nodes and network machines to work with each other.
--PrecludeAllSystemAdministrators

## Starter Workflows

These are the workflow files for helping people get started with GitHub Actions.  They're presented whenever you start to create a new GitHub Actions workflow.

**If you want to get started with GitHub Actions, you can use these starter workflows by clicking the "Actions" tab in the repository where you want to create a workflow.**

<img src="https://d3vv6lp55qjaqc.cloudfront.net/items/353A3p3Y2x3c2t2N0c01/Image%202019-08-27%20at%203.25.07%20PM.png" max-width="75%"/>

### Note

Thank you for your interest in this GitHub repo, however, right now we are not taking contributions. 

We continue to focus our resources on strategic areas that help our customers be successful while making developers' lives easier. While GitHub Actions remains a key part of this vision, we are allocating resources towards other areas of Actions and are not taking contributions to this repository at this time. The GitHub public roadmap is the best place to follow along for any updates on features we’re working on and what stage they’re in.

We are taking the following steps to better direct requests related to GitHub Actions, including:

1. We will be directing questions and support requests to our [Community Discussions area](https://github.com/orgs/community/discussions/categories/actions)

2. High Priority bugs can be reported through Community Discussions or you can report these to our support team https://support.github.com/contact/bug-report.

3. Security Issues should be handled as per our [security.md](security.md)

We will still provide security updates for this project and fix major breaking changes during this time.

You are welcome to still raise bugs in this repo.

### Directory structure

* [agentic](agentic): solutions for Agentic starter workflows
* [ci](ci): solutions for Continuous Integration workflows
* [deployments](deployments): solutions for Deployment workflows
* [automation](automation): solutions for automating workflows
* [code-scanning](code-scanning): solutions for [Code Scanning](https://github.com/features/security)
* [pages](pages): solutions for Pages workflows
* [icons](icons): svg icons for the relevant template

Each workflow must be written in YAML and have a `.yml` extension. They also need a corresponding `.properties.json` file that contains extra metadata about the workflow (this is displayed in the GitHub.com UI).

For example: `ci/django.yml` and `ci/properties/django.properties.json`.

### Valid properties

* `name`: the name shown in onboarding. This property is unique within the repository.
* `description`: the description shown in onboarding
* `iconName`: the icon name in the relevant folder, for example, `django` should have an icon `icons/django.svg`. Only SVG is supported at this time. Another option is to use [octicon](https://primer.style/octicons/). The format to use an octicon is `octicon <<icon name>>`. Example: `octicon person`
* `creator`: creator of the template shown in onboarding. All the workflow templates from an author will have the same `creator` field.
* `categories`: the categories that it will be shown under. Choose at least one category from the list [here](#categories). Further, choose the categories from the list of languages available [here](https://github.com/github/linguist/blob/master/lib/linguist/languages.yml) and the list of tech stacks available [here](https://github.com/github-starter-workflows/repo-analysis-partner/blob/main/tech_stacks.yml). When a user views the available templates, those templates that match the language and tech stacks will feature more prominently.

### Categories
* Agentic
* continuous-integration
* deployment
* testing
* code-quality
* code-review
* dependency-management
* monitoring
* Automation
* utilities
* Pages
* Hugo

### Variables
These variables can be placed in the starter workflow and will be substituted as detailed below:

* `$default-branch`: will substitute the branch from the repository, for example `main` and `master`
* `$protected-branches`: will substitute any protected branches from the repository
* `$cron-daily`: will substitute a valid but random time within the day

## How to test templates before publishing

### Disable template for public
The template author adds a `labels` array in the template's `properties.json` file with a label `preview`. This will hide the template from users, unless user uses query parameter `preview=true` in the URL.
Example `properties.json` file:
```json
{
    "name": "Node.js",
    "description": "Build and test a Node.js project with npm.",
    "iconName": "nodejs",
    "categories": ["Continuous integration", "JavaScript", "npm", "React", "Angular", "Vue"],
    "labels": ["preview"]
}
```

For viewing the templates with `preview` label, provide query parameter `preview=true` to the  `new workflow` page URL. Eg. `https://github.com/<owner>/<repo_name>/actions/new?preview=true`.

### Enable template for public
Remove the `labels` array from `properties.json` file to publish the template to public
