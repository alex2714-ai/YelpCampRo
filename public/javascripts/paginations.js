const paginate = document.getElementById("paginate");
const bt = document.getElementById("bt");
// const filter = document.getElementById("filter");

const $campgroundsContainer = $("#campgrounds-container");
paginate.addEventListener("click", function (e) {
  e.preventDefault();
  fetch(this.href)
    .then((response) => response.json())
    .then((data) => {
      for (const campground of data.docs) {
        let template = generateCampground(campground);
        $campgroundsContainer.append(template);
      }

      let { nextPage } = data;
      this.href = this.href.replace(/page=\d+/, `page=${nextPage}`);
      if (!data.hasNextPage) {
        paginate.setAttribute("hidden", "");
      }
    })
    .catch((err) => console.log("ERROR", err));
});

function generateCampground(campground) {
  let template = `<div class="card mb-3">
    <div class="row">
        <div class="col-md-4">
            <img class="img-fluid" alt="" src="${
              campground.images.length
                ? campground.images[0].url
                : "https://res.cloudinary.com/dtxw73hy3/image/upload/v1600103881/YelpCamp/lz8jjv2gyynjil7lswf4.png"
            }">
        </div>
        <div class="col-md-8">
            <div class="card-body">
                <h5 class="card-title">${campground.title} </h5>
    
                <p class="card-text">${campground.description}</p>
                <p class="card-text">
                <small class="text-muted">Județul: ${
                  campground.location["judet"]
                }, Localitate: ${campground.location["localitate"]}</small>
              </p>
                <p class="list-group-item">Price: ${campground.price}$/night</p>
                <a class="btn btn-primary" href="/campgrounds/${
                  campground._id
                }">View ${campground.title}</a>
            </div>
        </div>
    </div>
    </div>`;
  return template;
}
