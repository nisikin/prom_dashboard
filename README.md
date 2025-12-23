# prom_dashboard

### Run Backend

#### 1. Set up environment

Install uv (if you didn't install uv yet)

```bash
pip install uv
```

------------------------------------------------------------------------------------------------
**ex.** How to change source for uv(换源)

create uv global config file:

- Windows:
create `/uv/uv.toml` under `%APPDATA%/`
- Linux/MacOS:
create `/uv/uv.toml` under `~/.config/`

add following lines to `uv.toml`:

```
[[index]]
url = "https://mirrors.aliyun.com/pypi/simple/"
default = true
# 或使用清华源
# url = "https://pypi.tuna.tsinghua.edu.cn/simple/"
```
------------------------------------------------------------------------------------------------

Then, run `uv sync` under `/backend`.

#### 2. Run Backend

```bash
backend/ $ uv run app/main.py
```

For development, you need to set `DEV` environment variable to `true` (see `app/core/config.py` for details)

- windows powershell:
```bash
$env:DEV = "true"
uv run app/main.py
```

- linux/macos terminal:
```bash
export DEV="true"
uv run app/main.py
```

Then, open `http://localhost:8000/docs` to see the API documentation

### Run Frontend

Under `/frontend`, run

#### 1. Install dependencies

```bash
npm install
```

#### 2. Run Frontend

```bash
npm run dev
```
