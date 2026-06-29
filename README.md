
## How to compile

### Fetch PMP and Rosetta

```sh
mkdir build && cd build
cmake .. && make
cd ..
```

### Generate the generator for PMP

```sh
extern/rosetta/bin/rosetta_gen manifest.json gen
cmake -S gen -B gen/build && cmake --build gen/build
```

### Generate the bindings

```sh
./generator bindings
```

### Compile the bindings

Example for Python:
```sh
cd bindings/python
mkdir build && cd build
cmake .. && make
```

Example for nodejs:
```sh
cd bindings/node
npm i
npm run build
```

