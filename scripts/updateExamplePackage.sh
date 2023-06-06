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
echo -e "\n\n"
# Remove existing dist/ directory
rm -r dist/

# Build the project
yarn build

# Create a tarball
yarn pack



# Generate the tarball file name
tarball_file="${package_name}-v${version}.tgz"

echo -e "\n"
echo "---------- Installing ----------"
echo " tarbal name:| ${tarball_file} |"
echo -e "\n\n"


# Copy the tarball to the examples folder
cp -f "${tarball_file}" "example/${tarball_file}"

# Change directory to examples/
cd example/

# Install the new tarball as a dependency
yarn add "./${tarball_file}"