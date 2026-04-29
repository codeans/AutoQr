package de.autoqr.app

import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class IncomingCallActivity : AppCompatActivity() {
  private var callId: String = ""

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    configureLockScreenWindow()
    callId = intent.getStringExtra(IncomingCallForegroundService.EXTRA_CALL_ID) ?: ""
    if (callId.isBlank()) {
      finish()
      return
    }
    setContentView(buildContentView())
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
  }

  private fun configureLockScreenWindow() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
      val keyguard = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
      keyguard.requestDismissKeyguard(this, null)
    } else {
      @Suppress("DEPRECATION")
      window.addFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
          WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
          WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
      )
    }
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
  }

  private fun buildContentView(): View {
    val callerName = intent.getStringExtra(IncomingCallForegroundService.EXTRA_CALLER_NAME) ?: "AutoQr incident call"
    val handle = intent.getStringExtra(IncomingCallForegroundService.EXTRA_HANDLE) ?: "AutoQr caller"
    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      setPadding(48, 72, 48, 72)
      setBackgroundColor(Color.rgb(8, 13, 24))
      layoutParams = LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        LinearLayout.LayoutParams.MATCH_PARENT
      )
    }

    val label = TextView(this).apply {
      text = "INCOMING AUTOQR CALL"
      setTextColor(Color.rgb(147, 197, 253))
      textSize = 14f
      gravity = Gravity.CENTER
      letterSpacing = 0.08f
    }
    val title = TextView(this).apply {
      text = callerName
      setTextColor(Color.WHITE)
      textSize = 30f
      gravity = Gravity.CENTER
      setPadding(0, 20, 0, 8)
    }
    val subtitle = TextView(this).apply {
      text = handle
      setTextColor(Color.rgb(209, 213, 219))
      textSize = 18f
      gravity = Gravity.CENTER
      setPadding(0, 0, 0, 96)
    }
    val actions = LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER
    }

    actions.addView(actionButton("Decline", Color.rgb(220, 38, 38)) {
      IncomingCallForegroundService.startServiceWithExtras(
        this@IncomingCallActivity,
        Intent(intent).apply { action = IncomingCallForegroundService.ACTION_DECLINE }
      )
      finishAndRemoveTask()
    })
    actions.addView(actionButton("Accept", Color.rgb(22, 163, 74)) {
      IncomingCallForegroundService.startServiceWithExtras(
        this@IncomingCallActivity,
        Intent(intent).apply { action = IncomingCallForegroundService.ACTION_ACCEPT }
      )
      finishAndRemoveTask()
    })

    root.addView(label)
    root.addView(title)
    root.addView(subtitle)
    root.addView(actions)
    return root
  }

  private fun actionButton(label: String, color: Int, onClick: () -> Unit): TextView =
    TextView(this).apply {
      text = label
      textSize = 18f
      setTextColor(Color.WHITE)
      gravity = Gravity.CENTER
      setBackgroundColor(color)
      setPadding(36, 28, 36, 28)
      layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
        marginStart = 12
        marginEnd = 12
      }
      setOnClickListener { onClick() }
    }

  override fun onBackPressed() {
    moveTaskToBack(true)
  }
}
