package de.autoqr.app

import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.app.KeyguardManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.RippleDrawable
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowInsets
import android.view.WindowManager
import android.view.animation.AccelerateDecelerateInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.Space
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class IncomingCallActivity : AppCompatActivity() {
  private var callId: String = ""
  private var closeReceiver: BroadcastReceiver? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    configureLockScreenWindow()
    callId = intent.getStringExtra(IncomingCallForegroundService.EXTRA_CALL_ID) ?: ""
    if (callId.isBlank()) {
      finish()
      return
    }
    registerCloseReceiver()
    setContentView(buildContentView())
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    callId = intent.getStringExtra(IncomingCallForegroundService.EXTRA_CALL_ID) ?: callId
  }

  override fun onDestroy() {
    closeReceiver?.let {
      try {
        unregisterReceiver(it)
      } catch (_: Exception) {
      }
    }
    closeReceiver = null
    super.onDestroy()
  }

  private fun configureLockScreenWindow() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    }
    @Suppress("DEPRECATION")
    window.addFlags(
      WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
        WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
    )
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      try {
        val keyguard = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        keyguard.requestDismissKeyguard(this, null)
      } catch (_: Exception) {
      }
    }
  }

  private fun registerCloseReceiver() {
    val receiver = object : BroadcastReceiver() {
      override fun onReceive(context: Context, intent: Intent) {
        val targetCallId = intent.getStringExtra(IncomingCallForegroundService.EXTRA_CALL_ID)
        if (targetCallId.isNullOrBlank() || targetCallId == callId) finishAndRemoveTask()
      }
    }
    closeReceiver = receiver
    val filter = IntentFilter(IncomingCallForegroundService.ACTION_CLOSE_INCOMING_UI)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
    } else {
      @Suppress("DEPRECATION")
      registerReceiver(receiver, filter)
    }
  }

  private fun buildContentView(): View {
    val callerName = intent.getStringExtra(IncomingCallForegroundService.EXTRA_CALLER_NAME) ?: "AutoQr incident call"
    val handle = intent.getStringExtra(IncomingCallForegroundService.EXTRA_HANDLE) ?: "Incoming vehicle assistance call"

    val root = FrameLayout(this).apply {
      background = GradientDrawable(
        GradientDrawable.Orientation.TOP_BOTTOM,
        intArrayOf(Color.rgb(4, 10, 20), Color.rgb(8, 22, 31), Color.rgb(7, 31, 24))
      )
      layoutParams = FrameLayout.LayoutParams(
        FrameLayout.LayoutParams.MATCH_PARENT,
        FrameLayout.LayoutParams.MATCH_PARENT
      )
    }

    val content = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      setPadding(dp(28), topSafePadding(), dp(28), bottomSafePadding())
    }
    root.addView(content, FrameLayout.LayoutParams(
      FrameLayout.LayoutParams.MATCH_PARENT,
      FrameLayout.LayoutParams.MATCH_PARENT
    ))

    content.addView(statusPill())
    content.addView(Space(this), LinearLayout.LayoutParams(1, dp(34)))
    content.addView(avatarView())
    content.addView(Space(this), LinearLayout.LayoutParams(1, dp(34)))
    content.addView(textView(callerName, 29f, Color.WHITE, Typeface.BOLD).apply {
      maxLines = 2
      gravity = Gravity.CENTER
    }, LinearLayout.LayoutParams(
      LinearLayout.LayoutParams.MATCH_PARENT,
      LinearLayout.LayoutParams.WRAP_CONTENT
    ))
    content.addView(textView(handle, 17f, Color.rgb(202, 213, 225), Typeface.NORMAL).apply {
      maxLines = 2
      gravity = Gravity.CENTER
      setPadding(0, dp(10), 0, 0)
    }, LinearLayout.LayoutParams(
      LinearLayout.LayoutParams.MATCH_PARENT,
      LinearLayout.LayoutParams.WRAP_CONTENT
    ))
    content.addView(textView("Incoming call...", 15f, Color.rgb(134, 239, 172), Typeface.BOLD).apply {
      gravity = Gravity.CENTER
      setPadding(0, dp(22), 0, 0)
      alpha = 0.85f
      ObjectAnimator.ofFloat(this, View.ALPHA, 0.45f, 1f).apply {
        duration = 900
        repeatMode = ValueAnimator.REVERSE
        repeatCount = ValueAnimator.INFINITE
        start()
      }
    })
    content.addView(Space(this), LinearLayout.LayoutParams(1, 0, 1f))
    content.addView(actionRow())
    return root
  }

  private fun statusPill(): TextView =
    textView("AUTOQR VEHICLE ASSISTANCE", 12f, Color.rgb(187, 247, 208), Typeface.BOLD).apply {
      gravity = Gravity.CENTER
      letterSpacing = 0.08f
      setPadding(dp(14), dp(8), dp(14), dp(8))
      background = roundedDrawable(Color.argb(40, 34, 197, 94), dp(22), Color.argb(130, 34, 197, 94), 1)
    }

  private fun avatarView(): FrameLayout {
    val size = dp(148)
    val avatarSize = dp(102)
    return FrameLayout(this).apply {
      layoutParams = LinearLayout.LayoutParams(size, size)
      repeat(3) { index ->
        addView(pulseRing(index), FrameLayout.LayoutParams(size, size, Gravity.CENTER))
      }
      addView(ImageView(this@IncomingCallActivity).apply {
        setImageResource(applicationInfo.icon)
        setPadding(dp(22), dp(22), dp(22), dp(22))
        background = ovalDrawable(Color.rgb(12, 51, 40), Color.argb(170, 134, 239, 172), 2)
        elevation = dp(10).toFloat()
      }, FrameLayout.LayoutParams(avatarSize, avatarSize, Gravity.CENTER))
    }
  }

  private fun pulseRing(index: Int): View =
    View(this).apply {
      background = ovalDrawable(Color.TRANSPARENT, Color.argb(120, 34, 197, 94), 2)
      alpha = 0.2f
      val delay = index * 420L
      listOf(
        ObjectAnimator.ofFloat(this, View.SCALE_X, 0.68f, 1.08f),
        ObjectAnimator.ofFloat(this, View.SCALE_Y, 0.68f, 1.08f),
        ObjectAnimator.ofFloat(this, View.ALPHA, 0.34f, 0f)
      ).forEach { animator ->
        animator.duration = 1600
        animator.startDelay = delay
        animator.repeatCount = ValueAnimator.INFINITE
        animator.interpolator = AccelerateDecelerateInterpolator()
        animator.start()
      }
    }

  private fun actionRow(): LinearLayout =
    LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER
      setPadding(0, dp(8), 0, 0)
      addView(actionColumn("x", "Decline", Color.rgb(239, 68, 68)) {
        IncomingCallForegroundService.startServiceWithExtras(
          this@IncomingCallActivity,
          Intent(intent).apply {
            action = IncomingCallForegroundService.ACTION_DECLINE
            putExtra(IncomingCallForegroundService.EXTRA_ACCEPT_SOURCE, "lockscreen")
          }
        )
        finishAndRemoveTask()
      })
      addView(Space(this@IncomingCallActivity), LinearLayout.LayoutParams(dp(44), 1))
      addView(actionColumn("✓", "Accept", Color.rgb(34, 197, 94)) {
        IncomingCallForegroundService.startServiceWithExtras(
          this@IncomingCallActivity,
          Intent(intent).apply {
            action = IncomingCallForegroundService.ACTION_ACCEPT
            putExtra(IncomingCallForegroundService.EXTRA_ACCEPT_SOURCE, "lockscreen")
          }
        )
        moveTaskToBack(true)
        finishAndRemoveTask()
      })
    }

  private fun actionColumn(icon: String, label: String, color: Int, onClick: () -> Unit): LinearLayout =
    LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      val button = TextView(this@IncomingCallActivity).apply {
        text = icon
        textSize = if (icon == "x") 32f else 34f
        typeface = Typeface.DEFAULT_BOLD
        setTextColor(Color.WHITE)
        gravity = Gravity.CENTER
        background = rippleOval(color)
        elevation = dp(8).toFloat()
        setOnClickListener { onClick() }
      }
      addView(button, LinearLayout.LayoutParams(dp(78), dp(78)))
      addView(textView(label, 14f, Color.rgb(226, 232, 240), Typeface.BOLD).apply {
        gravity = Gravity.CENTER
        setPadding(0, dp(12), 0, 0)
      }, LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.WRAP_CONTENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      ))
    }

  private fun textView(value: String, size: Float, color: Int, style: Int): TextView =
    TextView(this).apply {
      text = value
      textSize = size
      setTextColor(color)
      typeface = Typeface.create(Typeface.DEFAULT, style)
      includeFontPadding = true
    }

  private fun roundedDrawable(color: Int, radius: Int, strokeColor: Int, strokeWidth: Int): GradientDrawable =
    GradientDrawable().apply {
      shape = GradientDrawable.RECTANGLE
      cornerRadius = radius.toFloat()
      setColor(color)
      setStroke(dp(strokeWidth), strokeColor)
    }

  private fun ovalDrawable(color: Int, strokeColor: Int, strokeWidth: Int): GradientDrawable =
    GradientDrawable().apply {
      shape = GradientDrawable.OVAL
      setColor(color)
      setStroke(dp(strokeWidth), strokeColor)
    }

  private fun rippleOval(color: Int): RippleDrawable =
    RippleDrawable(
      android.content.res.ColorStateList.valueOf(Color.argb(50, 255, 255, 255)),
      ovalDrawable(color, Color.argb(70, 255, 255, 255), 1),
      ovalDrawable(Color.WHITE, Color.TRANSPARENT, 0)
    )

  private fun topSafePadding(): Int {
    val fallback = dp(56)
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return fallback
    val insets = window.decorView.rootWindowInsets ?: return fallback
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      maxOf(fallback, insets.getInsets(WindowInsets.Type.statusBars()).top + dp(28))
    } else {
      @Suppress("DEPRECATION")
      maxOf(fallback, insets.systemWindowInsetTop + dp(28))
    }
  }

  private fun bottomSafePadding(): Int {
    val fallback = dp(34)
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return fallback
    val insets = window.decorView.rootWindowInsets ?: return fallback
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      maxOf(fallback, insets.getInsets(WindowInsets.Type.navigationBars()).bottom + dp(22))
    } else {
      @Suppress("DEPRECATION")
      maxOf(fallback, insets.systemWindowInsetBottom + dp(22))
    }
  }

  private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

  @Deprecated("Android framework callback is deprecated; kept for locked-screen back behavior.")
  override fun onBackPressed() {
    moveTaskToBack(true)
  }
}
