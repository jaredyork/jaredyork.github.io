var initialized = false;
var coffee = null;
var direction = "up";
var level = 0;
var speed = 0.1;

function coffeeloop()
{
  if (!initialized)
  {
    console.log("Coffeeloop initialized!");
    coffee = document.getElementsByClassName("coffee-steam")[0];
    console.log("top: " + coffee.style);
    initialized = true;
  }

  if (direction == "up")
  {
    if (level > -5)
    {
      level -= 0.1;
    }
    else
    {
      direction = "down";
    }
  }
  else if (direction == "down")
  {
    if (level < 3)
    {
      level += 0.1;
    }
    else
    {
      direction = "up";
    }
  }

  coffee.style.top = (-10 + level) + "px";

  requestAnimationFrame(coffeeloop);
}

window.addEventListener("DOMContentLoaded", function() {
  coffeeloop();
});
