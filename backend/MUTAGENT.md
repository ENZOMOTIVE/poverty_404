# Mutagent Setup

The requested command was attempted from `backend`:

```bash
bunx @mutagent init
```

Bun rejects `@mutagent` because scoped packages need a package name. The valid CLI package is `@mutagent/cli`, with binary `mutagent`.

The correct Bun form is:

```bash
bunx -p @mutagent/cli mutagent init
```

That command is currently blocked by MutagenT authentication:

```text
Authentication required before init
Suggestion: Run: mutagent auth login --browser
```

Complete the login first:

```bash
bunx -p @mutagent/cli mutagent login --browser --json
bunx -p @mutagent/cli mutagent init --json
```

After authentication, also run:

```bash
bunx -p @mutagent/cli mutagent workspaces list --json
bunx -p @mutagent/cli mutagent skills install --json
```
