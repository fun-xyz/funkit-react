#!/usr/bin/env zsh

# Default values
version="0.0.1"
package_name="fun-wallet-react"

# Parse command-line options
while getopts "n:v:" opt; do
  case $opt in
    n)
      package_name="$OPTARG"
      ;;
    v)
      version="$OPTARG"
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

echo "Package name: ${package_name}"
echo "Version: ${version}"
echo "---------- Building ----------"
echo -e "\n"
# Remove existing dist/ directory
rm -r dist/

# Build the project
yarn build

echo "---------- Packing ----------"
echo -e "\n"
# Create a tarball
npm pack



# Generate the tarball file name
tarball_file="${package_name}-${version}.tgz"

echo -e "\n"
echo "---------- Installing ----------"
echo " tarbal name:| ${tarball_file} |"
echo -e "\n\n"

# Change directory to examples/
cd example/

rm "${tarball_file}"

ls
# Copy the tarball to the examples folder
cp -f "../${tarball_file}" "./${tarball_file}"


# Install the new tarball as a dependency
yarn add "./${tarball_file}"