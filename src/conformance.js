import * as bpmnvisu from "bpmn-visualization";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";

export function showConformanceData(bpmnVisualization) {
  const registeredBpmnElements = new Map();
  const bpmnContainerElt = window.document.getElementById("bpmn-container");

  const buttonFontElement = document.getElementById("font_configuration");
  const buttonFrequencyData = document.getElementById("frequency_data");
  const buttonGlobalStatistics = document.getElementById("global_statistics");
  const buttonRuleConformance = document.getElementById(
    "precedence_rule_conformance"
  );

  buttonFontElement.addEventListener("click", function () {
    if (buttonFontElement.innerText === "Apply custom font") {
      const activities = bpmnVisualization.bpmnElementsRegistry.getElementsByKinds(
        [
          bpmnvisu.ShapeBpmnElementKind.TASK,
          bpmnvisu.ShapeBpmnElementKind.CALL_ACTIVITY
        ]
      );
      buttonFontElement.innerText = "Reset default font";
    } else {
      buttonFontElement.innerText = "Apply custom font";
    }
  });

  buttonFrequencyData.addEventListener("click", function () {
    if (buttonFrequencyData.innerText === "Show frequency data") {
      buttonFrequencyData.innerText = "Remove frequency data";
    } else {
      buttonFrequencyData.innerText = "Show frequency data";
    }
  });

  buttonGlobalStatistics.addEventListener("click", function () {
    if (buttonGlobalStatistics.innerText === "Show global statistics") {
      buttonGlobalStatistics.innerText = "Hide global statistics";
      bpmnVisualization.bpmnElementsRegistry.addOverlays("Event_1jrf21v", {
        position: "middle-right",
        label: "⏳days \n mean: 10.1 \n median: 14.2",
        style: {
          font: { color: "Red", size: 14 },
          fill: { color: "White", opacity: 40 },
          stroke: { color: "Red", width: 0 }
        }
      });
    } else {
      bpmnVisualization.bpmnElementsRegistry.removeAllOverlays("Event_1jrf21v");
      buttonGlobalStatistics.innerText = "Show global statistics";
    }
  });

  const overlayConfig = {
    style: {
      font: {
        color: "red",
        size: 16
      },
      stroke: {
        color: "white"
      }
    }
  };
  const prec_violation_overlay = {
    position: "top-left",
    label: "❗⏭",
    ...overlayConfig
  };
  bpmnVisualization.bpmnElementsRegistry.addOverlays(
    "Activity_0yabbur",
    prec_violation_overlay
  );

  bpmnVisualization.bpmnElementsRegistry.addOverlays(
    "Activity_1u4jwkv",
    prec_violation_overlay
  );

  const violActivityElt1 = bpmnVisualization.bpmnElementsRegistry.getElementsByIds(
    "Activity_0yabbur"
  )[0].htmlElement;

  violActivityElt1.onclick = () => {
    //change activity fill color
    bpmnVisualization.bpmnElementsRegistry.addCssClasses(
      "Activity_0yabbur",
      "highlight-rule-violation"
    );
    bpmnVisualization.bpmnElementsRegistry.addCssClasses(
      "Activity_1u4jwkv",
      "pulse-rule-violation-level2"
    );
    bpmnVisualization.bpmnElementsRegistry.addCssClasses(
      "Activity_00vbm9s",
      "pulse-rule-violation-level1"
    );
    //add overlays and tiptools showing more info
    addPopover(
      bpmnVisualization.bpmnElementsRegistry.getElementsByIds(
        "Activity_0yabbur"
      )
    );
  };

  /*const violActivityElt2 = bpmnVisualization.bpmnElementsRegistry.getElementsByIds(
    "Activity_1u4jwkv"
  )[0].htmlElement;
  
  violActivityElt2.onclick = () => {
    document.querySelectorAll(".bpmn-type-activity").forEach((el) => {
      el.classList.remove(
        "bpmn-type-activity",
        "highlight-rule-violation",
        "pulse-rule-violation"
      );
    });
    //change activity fill color
    bpmnVisualization.bpmnElementsRegistry.addCssClasses(
      "Activity_1u4jwkv",
      "highlight-rule-violation"
    );
    bpmnVisualization.bpmnElementsRegistry.addCssClasses(
      "Activity_00vbm9s",
      "pulse-rule-violation"
    );
    //add overlays and tiptools showing more info
  };*/

  buttonRuleConformance.addEventListener("click", function () {});

  // tippy global configuration
  tippy.setDefaultProps({
    content: "Loading...",
    allowHTML: true,
    onShow(instance) {
      instance.setContent(getContent(instance.reference));
    },
    onHidden(instance) {
      instance.setContent("Loading...");
    },

    // don't consider `data-tippy-*` attributes on the reference element as we fully manage tippy with javascript
    // and we cannot update the reference here as it is generated by bpmn-visualization
    ignoreAttributes: true,

    // https://atomiks.github.io/tippyjs/v6/all-props/#popperoptions
    // modifiers: [
    //     {
    //         name: 'computeStyles',
    //         options: {
    //             adaptive: false, // true by default
    //         },
    //     },
    // ],
    // popperOptions: {
    //     strategy: 'fixed',
    // },

    // https://atomiks.github.io/tippyjs/v6/all-props/#placement

    // https://atomiks.github.io/tippyjs/v6/all-props/#inlinepositioning
    // inlinePositioning: true,

    // https://atomiks.github.io/tippyjs/v6/all-props/#interactive
    interactive: true

    // https://atomiks.github.io/tippyjs/v6/all-props/#movetransition
    // custom transition --> not needed
    // moveTransition: 'transform 0.2s ease-out',
  });

  function addPopover(bpmnElements) {
    registerBpmnElements(bpmnElements);
    // Set the cursor to mark the elements as clickable
    bpmnVisualization.bpmnElementsRegistry.addCssClasses(
      bpmnElements.map((element) => element.bpmnSemantic.id),
      "c-hand"
    );

    const htmlElements = bpmnElements.map((elt) => elt.htmlElement);
    tippy(htmlElements, {
      theme: "violation",
      // sticky option behavior with this appendTo
      // The following is only needed to manage diagram navigation
      // Current issue while pan, the dimension of the popper changed while dragging which may also wrongly trigger a flip
      // during the pan and then, an new flip after dimensions are restored
      // for issue on pan, this may help: https://github.com/atomiks/tippyjs/issues/688

      // Notice that we cannot have the same configuration when we trigger on mouseover/focus or on click

      // When trigger on click
      // 'reference': work with zoom (do not move the popper), but disappear on pan, mainly vertical pan (translation computation issue)
      // 'popper': do not move on zoom, move on pan but also change the dimension of the tooltip while pan)
      appendTo: bpmnContainerElt,

      // When trigger on click
      // when using this, no resize issue on pan, but no more flip nor overflow. We can however use sticky: 'reference' with is better
      // It is almost ok when trigger on mouse over/focus as even if there is still an overflow issue, the tooltip disappear right
      // after the bpmn element is no more displayed after overflow
      //appendTo: bpmnContainerElt.parentElement,

      // https://atomiks.github.io/tippyjs/v6/all-props/#sticky
      // This has a performance cost since checks are run on every animation frame. Use this only when necessary!
      // enable it
      //sticky: true,
      // only check the "reference" rect for changes
      sticky: "reference",
      // only check the "popper" rect for changes
      // sticky: 'popper',

      duration: 400,
      delay: [200, 400],

      trigger: "click"
    });
  }
}

function registerBpmnElements(bpmnElements) {
  bpmnElements.forEach((elt) =>
    registeredBpmnElements.set(elt.htmlElement, elt.bpmnSemantic)
  );
}

function getContent(htmlElement) {
  const bpmnSemantic = registeredBpmnElements.get(htmlElement);
  if (bpmnSemantic.id === "Activity_0yabbur") {
    return `<div class="bpmn-popover">
    <b style="color:white">Precedence Rule Violation info:</b>
    <table border="1" bordercolor="white"  style="text-align:center; border-collapse:collapse;">
  <tr style="color:white">
    <th>Preceding activity</th>
    <th>#violations</th>
    <th>%traces</th>
  </tr>
  <tr>
    <td>Record Goods Receipt</td>
    <td>31</td>
    <td>5.80</td>
  </tr>
  <tr>
  <td>Record Invoice Receipt</td>
  <td>3</td>
  <td>0.67</td>
</tr>
</table>
    </div>`;
  }
}
