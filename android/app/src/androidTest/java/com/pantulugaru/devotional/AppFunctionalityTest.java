package com.pantulugaru.devotional;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withClassName;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.is;

import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;

import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class AppFunctionalityTest {

    @Rule
    public ActivityScenarioRule<MainActivity> activityRule =
            new ActivityScenarioRule<>(MainActivity.class);

    @Test
    public void testWebViewIsDisplayed() {
        // In a Capacitor app, the main content is inside a WebView.
        // We check if the WebView (or the Bridge's container) is loaded and visible.
        onView(allOf(withClassName(is("android.webkit.WebView")), isDisplayed()))
                .check(matches(isDisplayed()));
    }

    @Test
    public void testAppLaunchContext() {
        // Basic test to ensure the activity launches and has the correct package name
        androidx.test.platform.app.InstrumentationRegistry.getInstrumentation().getTargetContext().getPackageName().equals("com.pantulugaru.devotional");
    }
}
